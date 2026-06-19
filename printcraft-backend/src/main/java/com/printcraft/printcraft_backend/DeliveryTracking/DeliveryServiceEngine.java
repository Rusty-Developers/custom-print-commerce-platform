package com.printcraft.printcraft_backend.DeliveryTracking;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryEntity;
import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryEventHistoryRepository;
import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryRepository;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.EventDTO;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.UserTrackingDTO;
import com.printcraft.printcraft_backend.notification.EmailService;
import com.printcraft.printcraft_backend.notification.EmailTemplateBuilder;
import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class DeliveryServiceEngine{

    private final DeliveryRepository deliveryRepository;
    private final DeliveryEventHistoryRepository deliveryEventHistoryRepository;
    private final EmailService emailService;

    public DeliveryServiceEngine(
            DeliveryRepository deliveryRepository,
            DeliveryEventHistoryRepository deliveryEventHistoryRepository,
            EmailService emailService) {
        this.deliveryRepository = deliveryRepository;
        this.deliveryEventHistoryRepository = deliveryEventHistoryRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // BIRTH OF DELIVERY → after payment confirmed
    // =========================================================
    @Transactional
    public DeliveryEntity createDeliveryAfterPayment(Order order) {
        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalStateException("Payment not completed for order: " + order.getId());
        }
        if (deliveryRepository.existsByOrder(order)) {
            throw new IllegalStateException("Delivery already exists for order: " + order.getId());
        }

        DeliveryEntity delivery = new DeliveryEntity();
        delivery.setOrder(order);
        delivery.setDeliveryStatus(DeliveryStatus.CREATED);
        delivery.setDeliveryAttemptCount(0);
        deliveryRepository.save(delivery);

        DeliveryEvent event = new DeliveryEvent();
        event.setDeliveryEntity(delivery);
        event.setDeliveryStatus(DeliveryStatus.CREATED);
        event.setLocation("Warehouse");
        event.setDescription("Order created, awaiting packing");
        event.setTimestamp(LocalDateTime.now());
        deliveryEventHistoryRepository.save(event);

        return delivery;
    }

    // =========================================================
    // CORE STATE ENGINE → called by webhook handler
    // =========================================================
    @Transactional
    public DeliveryEvent updateDeliveryStatus(
            String awbCode,
            DeliveryStatus newStatus,
            String location,
            LocalDateTime incomingEventTimestamp) {

        // STEP 1 → Fetch delivery by AWB (webhook lookup key)
        DeliveryEntity delivery = deliveryRepository.findByAwbCode(awbCode)
                .orElseThrow(() -> new RuntimeException("No delivery found for AWB: " + awbCode));

        DeliveryStatus currentStatus = delivery.getDeliveryStatus();

        // STEP 2 → Terminal state guard
        // RTO webhooks after FAILED_FINAL = silent ACK, no state change
        // Any other transition from terminal = reject
        if (currentStatus.isTerminal()) {
            if (newStatus == DeliveryStatus.RTO_INITIATED) {
                log.info("RTO webhook received on terminal state {}. Saving event only.", currentStatus);
                return saveEventOnly(delivery, newStatus, location, incomingEventTimestamp);
            }
            throw new IllegalStateException(
                    "Cannot transition from terminal state '" + currentStatus +
                            "' to '" + newStatus + "'"
            );
        }

        // STEP 3 → Fetch latest event history
        Optional<DeliveryEvent> latestEventOptional =
                deliveryEventHistoryRepository
                        .findTopByDeliveryEntityOrderByTimestampDesc(delivery);

        // STEP 4 → No history path
        // Skip duplicate + stale checks (nothing to compare against)
        // Count + validation MUST still run
        if (latestEventOptional.isEmpty()) {
            newStatus = applyCountOverride(delivery, newStatus);
            validateTransition(currentStatus, newStatus);
            return updateDeliveryAndSaveEvent(delivery, newStatus, location, incomingEventTimestamp);
        }

        // STEP 5 → Extract last event details
        DeliveryEvent lastEvent = latestEventOptional.get();
        String lastLocation = lastEvent.getLocation();
        DeliveryStatus lastStatus = lastEvent.getDeliveryStatus();
        LocalDateTime lastEventTimestamp = lastEvent.getTimestamp();

        // STEP 6 → Duplicate check
        if (isDuplicate(location, lastLocation, newStatus, lastStatus)) {
            log.warn("Duplicate webhook ignored: status={}, location={}", newStatus, location);
            return lastEvent;
        }

        // STEP 7 → Stale / out-of-order event check
        if (!isIncomingEventNewer(lastEventTimestamp, incomingEventTimestamp)) {
            log.warn("Stale webhook received: incoming={}, last={}", incomingEventTimestamp, lastEventTimestamp);
            return saveEventOnly(delivery, newStatus, location, incomingEventTimestamp);
        }

        // STEP 8 → Count override (3rd attempt → FAILED_FINAL)
        newStatus = applyCountOverride(delivery, newStatus);

        // STEP 9 → Validate transition
        validateTransition(currentStatus, newStatus);

        // STEP 10 → All guards passed → persist
        return updateDeliveryAndSaveEvent(delivery, newStatus, location, incomingEventTimestamp);
    }

    // =========================================================
    // EXTRACTED HELPERS → single responsibility
    // =========================================================

    // Count override extracted → avoids duplication in isEmpty + normal path
    private DeliveryStatus applyCountOverride(DeliveryEntity delivery, DeliveryStatus newStatus) {
        if (newStatus == DeliveryStatus.DELIVERY_ATTEMPTED) {
            int updatedCount = delivery.getDeliveryAttemptCount() + 1;
            delivery.setDeliveryAttemptCount(updatedCount);
            log.info("Delivery attempt count updated to {}", updatedCount);
            if (updatedCount >= 3) {
                log.warn("3 delivery attempts exhausted. Moving to FAILED_FINAL.");
                return DeliveryStatus.FAILED_FINAL;
            }
        }
        return newStatus;
    }

    // Validation extracted → throws with clear message
    private void validateTransition(DeliveryStatus current, DeliveryStatus next) {
        if (!isValidTransitionState(current, next)) {
            throw new IllegalStateException(
                    "Invalid state transition: " + current + " → " + next
            );
        }
    }

    // =========================================================
    // PERSIST HELPERS
    // =========================================================
    private DeliveryEvent updateDeliveryAndSaveEvent(
            DeliveryEntity delivery,
            DeliveryStatus newStatus,
            String location,
            LocalDateTime timestamp) {

        delivery.setDeliveryStatus(newStatus);
        delivery.setCurrentLocation(location);
        if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setActualDeliveryDate(timestamp);
        }
        deliveryRepository.save(delivery);

        DeliveryEvent event = new DeliveryEvent();
        event.setDeliveryEntity(delivery);
        event.setDeliveryStatus(newStatus);
        event.setLocation(location);
        event.setTimestamp(timestamp);
        event.setDescription("Status updated to " + newStatus);
        return deliveryEventHistoryRepository.save(event);
    }

    private DeliveryEvent saveEventOnly(
            DeliveryEntity delivery,
            DeliveryStatus status,
            String location,
            LocalDateTime timestamp) {

        DeliveryEvent event = new DeliveryEvent();
        event.setDeliveryEntity(delivery);
        event.setDeliveryStatus(status);
        event.setLocation(location);
        event.setTimestamp(timestamp);
        event.setDescription("Out-of-order / stale courier event recorded");
        return deliveryEventHistoryRepository.save(event);
    }

    // =========================================================
    // STATE MACHINE
    // =========================================================
    private static final Map<DeliveryStatus, Set<DeliveryStatus>> VALID_TRANSITIONS = Map.of(
            DeliveryStatus.CREATED,            Set.of(DeliveryStatus.PACKED),
            DeliveryStatus.PACKED,             Set.of(DeliveryStatus.SHIPPED),
            DeliveryStatus.SHIPPED,            Set.of(DeliveryStatus.IN_TRANSIT),
            DeliveryStatus.IN_TRANSIT,         Set.of(DeliveryStatus.OUT_FOR_DELIVERY),
            DeliveryStatus.OUT_FOR_DELIVERY,   Set.of(
                    DeliveryStatus.DELIVERED,
                    DeliveryStatus.DELIVERY_ATTEMPTED,
                    DeliveryStatus.FAILED_FINAL),
            DeliveryStatus.DELIVERY_ATTEMPTED, Set.of(
                    DeliveryStatus.OUT_FOR_DELIVERY,
                    DeliveryStatus.FAILED_FINAL)
            // terminal states deliberately absent
    );

    private boolean isValidTransitionState(DeliveryStatus current, DeliveryStatus next) {
        Set<DeliveryStatus> allowed = VALID_TRANSITIONS.get(current);
        if (allowed == null) return false; // terminal = no entry = no transitions
        return allowed.contains(next);
    }

    // =========================================================
    // UTILITY CHECKS
    // =========================================================
    private boolean isDuplicate(
            String incomingLocation, String lastLocation,
            DeliveryStatus incomingStatus, DeliveryStatus lastStatus) {
        return incomingStatus == lastStatus && incomingLocation.equals(lastLocation);
    }

    private boolean isIncomingEventNewer(
            LocalDateTime lastTimestamp,
            LocalDateTime incomingTimestamp) {
        return lastTimestamp.isBefore(incomingTimestamp);
    }

    // =========================================================
    // EMAIL → called by webhook controller AFTER transaction commits
    // =========================================================
    public void sendStatusEmail(DeliveryEntity delivery, DeliveryStatus newStatus) {
        String customerEmail = delivery.getOrder().getUser().getEmail();
        String customerName  = delivery.getOrder().getUser().getName();
        Long   orderId       = delivery.getOrder().getId();
        String courierName   = delivery.getCourierName() != null
                ? delivery.getCourierName() : "our courier partner";

        switch (newStatus) {
            case PACKED -> emailService.sendEmail(customerEmail,
                    "🖨️ Your Order Is Being Prepared — #" + orderId,
                    EmailTemplateBuilder.buildOrderProcessing(customerName, orderId,
                            delivery.getOrder().getProduct().getProductName()));

            case SHIPPED -> emailService.sendEmail(customerEmail,
                    "🚚 Your Order Has Shipped — #" + orderId,
                    EmailTemplateBuilder.buildOrderShipped(customerName, orderId,
                            delivery.getAwbCode(), courierName));

            case IN_TRANSIT -> emailService.sendEmail(customerEmail,
                    "📍 Your Order Is in Transit — #" + orderId,
                    EmailTemplateBuilder.buildInTransit(customerName, orderId,
                            courierName, delivery.getAwbCode()));

            case OUT_FOR_DELIVERY -> emailService.sendEmail(customerEmail,
                    "📦 Out for Delivery Today — Order #" + orderId,
                    EmailTemplateBuilder.buildOutForDelivery(customerName, orderId,
                            courierName, delivery.getCurrentLocation()));

            case DELIVERY_ATTEMPTED -> emailService.sendEmail(customerEmail,
                    "⚠️ Delivery Attempted — We'll Try Again — Order #" + orderId,
                    EmailTemplateBuilder.buildDeliveryFailed(customerName, orderId,
                            "Our courier could not reach you. Re-delivery next working day."));

            case DELIVERED -> emailService.sendEmail(customerEmail,
                    "✅ Delivered — Order #" + orderId,
                    EmailTemplateBuilder.buildDelivered(customerName, orderId));

            case FAILED_FINAL -> emailService.sendEmail(customerEmail,
                    "❌ Could Not Deliver — Order #" + orderId,
                    EmailTemplateBuilder.buildDeliveryFailed(customerName, orderId,
                            "All delivery attempts exhausted."));

            default -> {}
        }
    }

    // =========================================================
    // USER TRACKING → by orderId
    // =========================================================
    public UserTrackingDTO getAllDetailsByOrderID(Long orderId) {
        DeliveryEntity delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        return mapToDto(delivery);
    }

    private UserTrackingDTO mapToDto(DeliveryEntity delivery) {
        List<EventDTO> events = delivery.getEvents().stream()
                .map(e -> EventDTO.builder()
                        .status(e.getDeliveryStatus())
                        .description(e.getDescription())
                        .currentLocation(e.getLocation())
                        .timestamp(e.getTimestamp())
                        .build())
                .collect(Collectors.toUnmodifiableList());

        return UserTrackingDTO.builder()
                .orderId(delivery.getOrder().getId())
                .currentStatus(delivery.getDeliveryStatus())
                .location(delivery.getCurrentLocation())
                .estimatedDeliveryDate(delivery.getEstimatedDeliveryDate() != null
                        ? delivery.getEstimatedDeliveryDate().toLocalDate() : null)
                .eventDTOS(events)
                .build();
    }
}