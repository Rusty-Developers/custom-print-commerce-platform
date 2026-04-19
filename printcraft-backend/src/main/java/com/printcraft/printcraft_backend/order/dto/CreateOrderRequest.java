package com.printcraft.printcraft_backend.order.dto;

import com.printcraft.printcraft_backend.product.domain.FrameTypes;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateOrderRequest {
    @NotNull
    private Long productId;
    @NotNull
    private ProductSizeInches sizeInches;
    @NotNull
    private ProductThickness thicknessMm;
    @NotNull
    private FrameTypes frameType;
    @NotBlank
    private String borderColor;
    private String customImageUrl;  // nullable - user may not upload image
    @Column(nullable = false)
    private String deliveryAddressSnapshot;
    @NotNull
     private Long addressId;  //product->addressID-->BACKEND TRUST

}
