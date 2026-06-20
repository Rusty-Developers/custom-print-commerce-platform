package com.printcraft.printcraft_backend.order.service;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryEntity;
import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryRepository;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.EventDTO;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.UserTrackingDTO;
import com.printcraft.printcraft_backend.address.domain.Addresses;
import com.printcraft.printcraft_backend.address.repository.AddressRepository;
import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderStatus;
import com.printcraft.printcraft_backend.order.dto.CreateOrderRequest;
import com.printcraft.printcraft_backend.order.repository.OrderRepository;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.repository.ProductRepository;
import com.printcraft.printcraft_backend.product.service.PricingService;
import com.printcraft.printcraft_backend.user.domain.User;
import com.printcraft.printcraft_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class OrderService {
    private final PricingService pricingService;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
//    private final Discount discount;
    private final OrderRepository orderRepository;
    private DeliveryRepository deliveryRepository;
    @Transactional
    public Order createOrder(CreateOrderRequest request, String phoneNo) {

        // 1. Get user by their phoneno as per the login flow
User user  = userRepository.findByphoneNo(phoneNo).orElseThrow(()->new RuntimeException("User not found"));
        // 2. Get product from DB
//        Optional<Product> product = productRepository.findById(request.getProductId()); //usuing optional to avoid NULL Issue
       Product product = productRepository.findById(request.getProductId())
               .orElseThrow(()->new RuntimeException("Product not found")); //usuing optional to avoid NULL Issue
        // 3. Get address by usuing  extracted user
        Addresses address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // 4. Validate address ownership--//product->addressID-->BACKEND TRUST
        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized address access");
        }
        // 5. Check stock
        if(product.getStockQuantity()<=0){
            throw new RuntimeException("Product out of stock");
        }
        // 6. Get price::Get base price from pricing table->Backend must derive price from DB based on exact size,thickness
        BigDecimal basePrice = pricingService.getPrice(product,request.getSizeInches(),request.getThicknessMm());
//        7.Check discount availability
       BigDecimal discountApplied = BigDecimal.ZERO;
//        //if any discount  available
//        if(discount.isActive()){
//            //applying P × (1 - D/100)
//            discountApplied=BasePrice.multiply(discount.getDiscountPercent()).divide(BigDecimal.valueOf(100));
//        }
       //8->Calculate final price
        BigDecimal finalPrice = basePrice.subtract(discountApplied);
        // 7. Build snapshot
        // 7. Build address snapshot
        String snapshot = address.getFullName() + ", " +
                address.getAddressLine() + ", " +
                (address.getLandmark() != null ? address.getLandmark() + ", " : "") +
                address.getCity() + ", " +
                address.getState() + " - " +
                address.getPinCode();
        //before the createorder final we need to proceed payment //call payment()

        // 9. Create order
   Order Createorder = Order.builder().user(user)
                   .product(product)
           .productSizeInches(request.getSizeInches())
           .productThickness(request.getThicknessMm())
           .frameTypes(request.getFrameType())
           .borderColor(request.getBorderColor())
           .customImageUrl(request.getCustomImageUrl())
           .address(address)
           .deliveryAddressSnapshot(snapshot)
           .basePrice(basePrice)
           .discountApplied(discountApplied)
                           .finalPrice(finalPrice)  //analytics Point
                                   .orderStatus(OrderStatus.PLACED)
                                           .paymentStatus(PaymentStatus.PENDING)
           .build();
        // 9. Save INTO REPO
      return      orderRepository.save(Createorder);
    }
    //validate payment
    public boolean isPaymentDone(PaymentStatus paymentStatus){
        if(paymentStatus==PaymentStatus.PAID) return true;
        return false;
    }
    //getMyOrders
    public List<Order> getMyOrders(String phoneNo){
        //first check existance whether it's present or not
        User user = userRepository.findByphoneNo(phoneNo).orElseThrow(()->new RuntimeException("User not found"));
        return orderRepository.findByUser(user);
    }

    public UserTrackingDTO getTrackingByOrderIdMethod(Long orderId) {
        //first find out the order
        Order order = orderRepository.findById(orderId).orElseThrow(
                ()-> new RuntimeException("Order ID not found: " + orderId)
        );
        DeliveryEntity delivery = deliveryRepository.getByOrder(order).orElseThrow(
                ()-> new RuntimeException("Order ID not found: " + orderId)
        );
        return mapToDTO(delivery);
    }

    private UserTrackingDTO mapToDTO(DeliveryEntity delivery) {
        List<EventDTO> eventDTOS = delivery.getEvents().stream().map(e-> EventDTO.builder()
                .status(e.getDeliveryStatus())
                .description(e.getDescription())
                .currentLocation(e.getLocation())
                .timestamp(e.getTimestamp())
                .build()).collect(Collectors.toUnmodifiableList());
        return UserTrackingDTO.builder()
                .orderId(delivery.getOrder().getId())
                .currentStatus(delivery.getDeliveryStatus())
                .location(delivery.getCurrentLocation())
                .estimatedDeliveryDate(delivery.getEstimatedDeliveryDate()!=null ?delivery.getEstimatedDeliveryDate().toLocalDate():null) // if it's LocalDateTime
                .eventDTOS(eventDTOS)
                .build();
    }
}
