package com.printcraft.printcraft_backend.Reviews.DTO;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponseDto {
    private Long id;
    private String username;    // who reviewed---//the user
    private Integer rating;
    private String comment;
    private String imageUrl;
    private LocalDateTime createdAt;
}
