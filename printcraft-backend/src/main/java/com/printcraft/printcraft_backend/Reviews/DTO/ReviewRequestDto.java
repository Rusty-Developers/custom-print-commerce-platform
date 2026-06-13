package com.printcraft.printcraft_backend.Reviews.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequestDto {
    @NotNull
    private String productId;
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;    // optional

    private String imageUrl;   // optional — URL from FileStorageService
}
