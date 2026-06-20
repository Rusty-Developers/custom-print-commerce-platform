package com.printcraft.printcraft_backend.product.dto.response;

import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PricingCellResponseDTO {
    private ProductSizeInches sizeInches;
    private ProductThickness thickness;
    private BigDecimal basePrice;
    private boolean isActive;
    private boolean isSet;   // true = a real row exists, false = placeholder
}
