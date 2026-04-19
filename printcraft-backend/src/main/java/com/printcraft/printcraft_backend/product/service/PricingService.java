package com.printcraft.printcraft_backend.product.service;

import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductPricing;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import com.printcraft.printcraft_backend.product.repository.ProductPricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service               // <-- WAS MISSING! Spring won't manage this bean without it
@RequiredArgsConstructor  // <-- Cleaner than manual constructor
public class PricingService {

    private final ProductPricingRepository productPricingRepository;

    public BigDecimal getPrice(Product product,
                               ProductSizeInches size,
                               ProductThickness thickness) {

        ProductPricing pricing = productPricingRepository
                .findByProductAndProductSizeInchesAndProductThicknessAndIsActiveTrue(
                        product,
                        size,
                        thickness
                )
                .orElseThrow(() -> new RuntimeException("Pricing not found"));

        return pricing.getBasePrice();
    }
}
