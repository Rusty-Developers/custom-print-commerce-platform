package com.printcraft.printcraft_backend.product.repository;

import com.printcraft.printcraft_backend.product.domain.Product;


import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductPricing;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductPricingRepository extends JpaRepository<ProductPricing, Long> {

    Optional<ProductPricing> findByProductAndProductSizeInchesAndProductThicknessAndIsActiveTrue(
            Product product,
            ProductSizeInches sizeInches,
            ProductThickness thickness
    );
}