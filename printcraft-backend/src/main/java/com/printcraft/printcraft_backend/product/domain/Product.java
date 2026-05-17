package com.printcraft.printcraft_backend.product.domain;

import com.printcraft.printcraft_backend.product.domain.FrameTypes;
import com.printcraft.printcraft_backend.product.domain.ProductCatagories;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import jakarta.persistence.Id;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "products")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Column(nullable = false)
    @Version
    private Long version;  //This enables optimistic locking && Prevents overselling when 500 users order same product
    private String productName;
    @Enumerated(EnumType.STRING)
    @Column(name = "catagory", nullable = false)
    private ProductCatagories productCatagories;
    private String description;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private FrameTypes frameTypes;
    @Builder.Default
    private boolean isProductActive = true;
    //  INT DEFAULT 0 Inventory — prevents overselling
    @Builder.Default
    private Integer stockQuantity = 0;
    @Column(nullable = false)
    private String imageUrl;
    @CreationTimestamp
    private LocalDateTime createdAt;
}