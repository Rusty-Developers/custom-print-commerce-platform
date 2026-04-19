package com.printcraft.printcraft_backend.order.domain;

import com.printcraft.printcraft_backend.address.domain.Addresses;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import com.printcraft.printcraft_backend.product.domain.FrameTypes;
import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import com.printcraft.printcraft_backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
//    BIGINT FK → users.id --->> one user can order multiple orderss
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id")
    private User user;
//    Many orders can be for the same product.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "products_id")
    private Product product;
    //size_inches
    @Enumerated(EnumType.STRING)
    private ProductSizeInches productSizeInches;
    @Enumerated(EnumType.STRING)
    private ProductThickness productThickness;
    @Enumerated(EnumType.STRING)
    private FrameTypes frameTypes;
    @Column(nullable = false)
    private String borderColor;  //It will be random by users demand
    @Column(nullable = false)
    private BigDecimal basePrice;
    @Builder.Default
    private BigDecimal discountApplied=BigDecimal.ZERO;
    @Column(nullable = false)
    private BigDecimal finalPrice;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    //ORDER DEFAULT = PLACED...ONLY WHEN ORDER PAYED
    private  OrderStatus orderStatus;
    @Column(unique = true)
    private String paymentId;   // Razorpay payment IDs are Strings like pay_ABC123XYZ
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    @Column(nullable = false)
    private String customImageUrl;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Addresses address;

    @Column(nullable = false)
    private String deliveryAddressSnapshot;  //frozen copy for keep history,logs
    @CreationTimestamp
    private LocalDateTime createdAt;
//    Set when payment confirmed--cancellation deadline
    private LocalDateTime confirmedAt;
}
