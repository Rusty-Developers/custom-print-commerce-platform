package com.printcraft.printcraft_backend.product.dto.request;

import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductPricingRequestDTO {
    @NotNull
    private ProductSizeInches productSizeInches;

    @NotNull
    private ProductThickness productThickness;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal basePrice;

    private boolean isActive;
}
