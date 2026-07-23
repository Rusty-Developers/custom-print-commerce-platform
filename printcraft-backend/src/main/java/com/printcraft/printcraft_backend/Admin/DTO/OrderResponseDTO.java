package com.printcraft.printcraft_backend.Admin.DTO;

import com.printcraft.printcraft_backend.order.domain.OrderStatus;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import com.printcraft.printcraft_backend.product.domain.FrameTypes;
import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@Getter
@Setter
public class OrderResponseDTO {
    //we only show admin what they actually needed to show
    private long id;
    // flattened from User — only what's needed
    private String customerName;
    private String customerPhone;

    // flattened from Product — just the name
    private String productName;
    //now additional imp product details
    private ProductSizeInches productSizeInches;
    private ProductThickness productThickness;
    private FrameTypes frameTypes;
    private String borderColor;
    //now we need the price segement

    private BigDecimal basePrice;
    private BigDecimal discountApplied;
    private BigDecimal finalPrice;
    //now we need to know order & payment status
    private OrderStatus orderStatus;
    private String paymentId;
    private PaymentStatus paymentStatus;
    //now we need the imageurl what they send and deliveryaddsnap
    private String customImageUrl;
    private String deliveryAddressSnapshot;
    //when order has created and when confirmed
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;


}
