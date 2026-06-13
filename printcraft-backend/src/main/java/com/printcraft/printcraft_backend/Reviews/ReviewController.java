package com.printcraft.printcraft_backend.Reviews;

import com.printcraft.printcraft_backend.Reviews.DTO.ReviewRequestDto;
import com.printcraft.printcraft_backend.Reviews.DTO.ReviewResponseDto;
import com.printcraft.printcraft_backend.Security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
//@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService; //injecting review service
    //injecting jwttutil
    private final JwtUtil jwtUtil;

    public ReviewController(ReviewService reviewService, JwtUtil jwtUtil) {
        this.reviewService = reviewService;
        this.jwtUtil = jwtUtil;
    }
    //submi review
    @PostMapping
    public ResponseEntity<ReviewResponseDto> submitReview(@Valid@RequestBody ReviewRequestDto requestDto, @RequestHeader("Authorization") String authHeader){
        String phoneNo = jwtUtil.extractPhone(authHeader.substring(7));
        ReviewResponseDto reviewResponseDto = reviewService.submitReviewMethod(requestDto,phoneNo);
        return  ResponseEntity.ok(reviewResponseDto);
    }
    //get all products review
    @GetMapping("/{productId}")
    public ResponseEntity<List<ReviewResponseDto>> getAllProductsReview(@PathVariable Long productId){
        List<ReviewResponseDto> reviewResponseDtos = reviewService.getAllReviewsOnProduct(productId);
        return ResponseEntity.ok(reviewResponseDtos);
    }
}
