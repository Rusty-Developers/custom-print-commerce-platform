package com.printcraft.printcraft_backend.product.domain;

import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "product_pricing", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"product_id", "productSizeInches", "productThickness"})
})  //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPricing {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    //BIGINT FK → products.id  AND One product → many price configs SO ONE - TO - MANY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;  //← points to ONE specific product (with its category+frameType already locked in)
    //    Size in inches
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductSizeInches productSizeInches;
    //thickness.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductThickness productThickness;

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    //    DECIMAL(10,2) NOT NULL--BOOLEAN DEFAULT TRUE --Price for this exact size+thickness combo
    @Column(nullable = false)
    private BigDecimal basePrice;
    @Builder.Default
    private boolean isActive = true;
}
