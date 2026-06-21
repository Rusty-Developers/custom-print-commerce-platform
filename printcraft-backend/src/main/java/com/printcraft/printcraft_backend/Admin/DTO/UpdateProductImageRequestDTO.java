package com.printcraft.printcraft_backend.Admin.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProductImageRequestDTO {
    @NotBlank
    private String imageUrl;
}
