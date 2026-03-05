package com.printcraft.printcraft_backend.product.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discounts")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    //BIGINT FK → products.id  AND One product → many price configs SO ONE - TO - MANY
    //discount-->> (BIGINT FK) → products.id
    //Notes
    //NULL = global discount, NOT NULL =
    //product-specific
//    One product can have MANY discounts over time (January sale, Diwali sale, etc.)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
//    DECIMAL(5,2) NOT NULL-TIMESTAMP
    @Column(nullable = false)
    private BigDecimal discountPercent;
    // Discount activation window
    @Column(name = "validfrom", nullable = false)
    private LocalDateTime validFrom;
    @Column(name = "validTo", nullable = false)
    private  LocalDateTime validTo;
    @Builder.Default
    private boolean isActive=true;
}
