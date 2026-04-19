package com.printcraft.printcraft_backend.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
//we can't return entities directly so need DTOS
public class ProductResponse {
    private Long id;
    private String productName;
    private String category;
    private String description;
    private String frameType;
    private List<String> availableSizes;
    private List<String> availableThickness;

    private BigDecimal basePrice;
    private BigDecimal finalPrice;

    private Integer stockQuantity;
    private String imageUrl;
}
