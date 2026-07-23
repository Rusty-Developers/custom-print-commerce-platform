package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.Admin.DTO.OrderResponseDTO;
import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOrderController {
    //injecting orderRepo
    private final OrderRepository orderRepository;
    //to make hibernate session open for accessing the datas fully
    @Transactional(readOnly = true)
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrdersTOAdmin(){
        List<OrderResponseDTO> allOrders = orderRepository.findAll().stream().map(this::toDto).toList();
        return ResponseEntity.ok(allOrders);
    }

    private OrderResponseDTO toDto(Order order) {
        return OrderResponseDTO.builder().id(order.getId())
                        .customerName(order.getUser() != null ?order.getUser().getName():null)
                .customerPhone(order.getUser().getPhoneNo()!=null?order.getUser().getPhoneNo():null)
                .productName(order.getProduct().getProductName()!=null?order.getProduct().getProductName():null)
                        .productSizeInches(order.getProductSizeInches())
                                .productThickness(order.getProductThickness())
                                        .frameTypes(order.getFrameTypes())
                                                .borderColor(order.getBorderColor())
                                                        .basePrice(order.getBasePrice())
                                                                .discountApplied(order.getDiscountApplied())
                                                                        .finalPrice(order.getFinalPrice())
                                                                                .orderStatus(order.getOrderStatus())
                                                                                        .paymentId(order.getPaymentId())
                                                                                                .paymentStatus(order.getPaymentStatus())
                                                                                                        .customImageUrl(order.getCustomImageUrl())
                                                                                                                .deliveryAddressSnapshot(order.getDeliveryAddressSnapshot())
                                                                                                                        .createdAt(order.getCreatedAt())
                                                                                                                                .confirmedAt(order.getConfirmedAt())
                                                                                                                                        .build();
    }
}
