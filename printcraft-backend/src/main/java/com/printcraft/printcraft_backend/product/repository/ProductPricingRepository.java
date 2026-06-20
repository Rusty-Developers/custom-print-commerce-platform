package com.printcraft.printcraft_backend.product.repository;

import com.printcraft.printcraft_backend.product.domain.Product;


import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductPricing;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductPricingRepository extends JpaRepository<ProductPricing, Long> {

    Optional<ProductPricing> findByProductAndProductSizeInchesAndProductThicknessAndIsActiveTrue(
            Product product,
            ProductSizeInches sizeInches,
            ProductThickness thickness
    );

//    This only finds active pricing rows.
//    That's fine for customers (they should only ever see active prices).
//    But admin needs something different: admin might want to find a row
//    that's currently inactive too — to reactivate it, fix its price, whatever.
//    If we reuse the customer query, admin would never be able to find/update an inactive row —
//    it'd just create a duplicate every time, which defeats the whole point of the unique constraint you just added.
//    So we need a second finder, without the IsActiveTrue filter.
Optional<ProductPricing> findByProductAndProductSizeInchesAndProductThickness(
        Product product,
        ProductSizeInches sizeInches,
        ProductThickness thickness
);
    List<ProductPricing> findByProduct(Product product);
}