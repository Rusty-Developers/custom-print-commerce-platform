package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.product.domain.FrameTypes;
import com.printcraft.printcraft_backend.product.domain.ProductCatagories;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateProductRequestDTO {
    @NotBlank
    private String productName;
    @NotNull
    private ProductCatagories productCatagories;
    private String description;
    @NotNull
    private FrameTypes frameTypes;
    @NotBlank
    private String imageUrl;
}
