package com.printcraft.printcraft_backend.DeliveryTracking;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.service.OrderService;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
public class DeliveryServiceEngine {
    private final OrderService orderService;
    private final DeliveryRepository deliveryRepository;
    private final DeliveryEventHistoryRepository deliveryEventHistoryRepository;
//avoid @Autowired for tight-coupling so used contructor injection
    public DeliveryServiceEngine(OrderService orderService, DeliveryRepository deliveryRepository, DeliveryEventHistoryRepository deliveryEventHistoryRepository) {
        this.orderService = orderService;
        this.deliveryRepository = deliveryRepository;
        this.deliveryEventHistoryRepository = deliveryEventHistoryRepository;
    }

    //we first need to give birth of delivery after payment done !!
    @Transactional
    public DeliveryEntity createDeliveryAfterPayment(Order order){
        //first chcek if the payment is done or not---validate payment
        if(order.getPaymentStatus()!=PaymentStatus.PAID){
            throw new RuntimeException("Payment not completed");
        }
//secondcheck-Check delivery not already created
//        Does a delivery already exist for this order?
        if (deliveryRepository.existsByOrder(order)) {
            throw new RuntimeException("Delivery already created");
        }
        //create delivery entity
        DeliveryEntity deliveryEntity = new DeliveryEntity();
        deliveryEntity.setOrder(order);
        deliveryEntity.setTrackingId(generateTrackingId(order));
        //marked status NOW->CREATED
        deliveryEntity.setDeliveryStatus(DeliveryStatus.CREATED);
     //save into DB
    deliveryRepository.save(deliveryEntity);
    //we have to add history at the same time
        DeliveryEvent deliveryEvent = new DeliveryEvent();
        deliveryEvent.setDeliveryEntity(deliveryEntity);
        deliveryEvent.setDeliveryStatus(DeliveryStatus.CREATED);
        deliveryEvent.setLocation("Warehouse");
        deliveryEvent.setDescription("Order created");
        deliveryEvent.setTimestamp(LocalDateTime.now());
  //save into db
        deliveryEventHistoryRepository.save(deliveryEvent);
        return deliveryEntity;
    }
    private String generateTrackingId(Order order) {

        return "TRK-" + order.getId() + "-" + System.currentTimeMillis();
    }

    //Update state our internal state engine
    //BOTH succeed ✔
    //OR BOTH rollback ❌
    @Transactional
    public DeliveryEvent updateDeliveryStatus(String trackingId,DeliveryStatus newStatus,String location,LocalDateTime incomingEventTimestamp){
        //get the delivery details
        //  STEP 1 -> FETCH DELIVERY
        //     =========================================================
        DeliveryEntity deliveryProduct = deliveryRepository.getByTrackingId(trackingId).orElseThrow(
                ()-> new RuntimeException("Invalid tracking id")
        );
        DeliveryStatus currentStatus = deliveryProduct.getDeliveryStatus();
        if(newStatus.equals(DeliveryStatus.SHIPPED)){
            //call courier API BY ADMIN ----courier API Calling
            //PENDING--AFTER CLIENT CONFIRMS WHETHER TO USE HSIPROCKET/DTDC/BLUEDIRT/DELHIVERY
        }
        //now our checking-->idempotency ignoring DUPLICATE Entry
        //passing the entity to get top /recent created status
        Optional<DeliveryEvent> latestEventOptional = deliveryEventHistoryRepository.findTopByDeliveryEntityOrderByTimestampDesc(deliveryProduct);
        //if NO HISTORY EXISTS
        if(latestEventOptional.isEmpty()){
            return updateDeliveryAndSaveEvent(
                    deliveryProduct,
                    newStatus,
                    location,
                    incomingEventTimestamp
            );
        }
        // STEP 4 -> EXTRACT LAST EVENT DETAILS
        // =========================================================
        DeliveryEvent lastEvent = latestEventOptional.get();
            String lastLocation = lastEvent.getLocation();
            DeliveryStatus lastStatus = lastEvent.getDeliveryStatus();
            //Timestamp
            LocalDateTime lastEventTimestamp = lastEvent.getTimestamp();
        // STEP 5 -> DUPLICATE CHECK
            if(isDuplicate(location,lastLocation,newStatus,lastStatus)){
                log.warn("Duplicate webhook ignored");
               return lastEvent;
            }
        // STEP 6 -> STALE / OLD EVENT CHECK
            if(!checkTimeEvenetTimeline(lastEventTimestamp,incomingEventTimestamp)){
                log.warn("Old delayed courier event received");
              //save into event history
                return saveEventOnly(deliveryProduct,newStatus,location,incomingEventTimestamp);
            }
        // STEP 7 -> RANK COMPARISON
        int currentRank = currentStatus.getRank();
        int newRank = newStatus.getRank();
        // STEP 8 -> BACKWARD TRANSITION
        // =========================================================
        if(newRank<currentRank){
            //backward
            throw new RuntimeException("Backward transition not allowed");
        }
        // STEP 9 -> FORWARD JUMP
        // =========================================================

        //if (newRank-currentRank)>>1
        else if(newRank>currentRank+1){
            //forward jump means, currsttaus = shipped and newrank suppose = deliver .
            //warning
            log.warn("Forward jump detected from {} to {}",currentStatus,newStatus);
        }
        // =========================================================
        // STEP 10 -> NORMAL / ACCEPTABLE UPDATE
        // =========================================================
        //STEP 11 -> Terminal states safety net

        if(!isValidTransitionState(currentStatus,newStatus)){
            throw new RuntimeException("Invalid state transition");
        };

        return updateDeliveryAndSaveEvent(
                deliveryProduct,
                newStatus,
                location,
                incomingEventTimestamp
        );
    }
//save into Mainentity and eventEntity
    private DeliveryEvent updateDeliveryAndSaveEvent(DeliveryEntity deliveryEntity, DeliveryStatus newStatus, String location, LocalDateTime incomingEventTimestamp) {
        // update main entity
         deliveryEntity.setDeliveryStatus(newStatus);
         deliveryEntity.setCurrentLocation(location);
         deliveryRepository.save(deliveryEntity);

        // create history event
        DeliveryEvent deliveryEvent = new DeliveryEvent();//create instance of delivery-event
        deliveryEvent.setDeliveryEntity(deliveryEntity);
        deliveryEvent.setDeliveryStatus(newStatus);
        deliveryEvent.setLocation(location);//saving location into event
        deliveryEvent.setTimestamp(incomingEventTimestamp);
        deliveryEvent.setDescription( "Delivery status updated to " + newStatus); //saving location into event);
        //save into repo
        return deliveryEventHistoryRepository.save(deliveryEvent);

    }
    // SAVE EVENT ONLY (for stale delayed events)
    private DeliveryEvent saveEventOnly(DeliveryEntity deliveryProduct, DeliveryStatus newStatus, String location, LocalDateTime incomingEventTimestamp) {
        DeliveryEvent deliveryEvent = new DeliveryEvent();
        deliveryEvent.setDeliveryEntity(deliveryProduct);
        deliveryEvent.setDeliveryStatus(newStatus);
        deliveryEvent.setLocation(location);//saving location into event
        deliveryEvent.setTimestamp(incomingEventTimestamp);
        deliveryEvent.setDescription("Old delayed courier event");
        //save into repo
        return deliveryEventHistoryRepository.save(deliveryEvent);
    }


    private boolean checkTimeEvenetTimeline(LocalDateTime lastEventTimestamp, LocalDateTime incomingEventTimestamp) {
        if(lastEventTimestamp.isBefore(incomingEventTimestamp)){
            return true;
        }
        return false; 
    }


    private boolean isDuplicate(String location, String lastLocation, DeliveryStatus newStatus, DeliveryStatus lastStatus) {
        if(newStatus.equals(lastStatus) && lastLocation.equals(location)){
            //duplicate so ignore
            return true;
        }
       return false;
    }

    private static final Map<DeliveryStatus, Set<DeliveryStatus>> VALID_TRANSITIONS = Map.of(
            DeliveryStatus.CREATED, Set.of(DeliveryStatus.PACKED),
            DeliveryStatus.PACKED, Set.of(DeliveryStatus.SHIPPED),
            DeliveryStatus.SHIPPED, Set.of(DeliveryStatus.IN_TRANSIT),
            DeliveryStatus.IN_TRANSIT, Set.of(DeliveryStatus.OUT_FOR_DELIVERY),
            DeliveryStatus.OUT_FOR_DELIVERY, Set.of(DeliveryStatus.DELIVERED, DeliveryStatus.FAILED)
    );
    private boolean isValidTransitionState(DeliveryStatus currentStatus, DeliveryStatus newStatus) {
        //logic wise->Given the current status, get all allowed next statuses, then check if the new status is inside that set.
        Set<DeliveryStatus> nextExpectedStatus = VALID_TRANSITIONS.get(currentStatus);
        if(nextExpectedStatus==null) return  false;
        //as newstatus is also we have to check as value exists...
        if(nextExpectedStatus.contains(newStatus)){
            return true;
        }
        return false;
    }

}
