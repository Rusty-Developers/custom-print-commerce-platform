package com.printcraft.printcraft_backend.Reviews;

import com.printcraft.printcraft_backend.Reviews.DTO.ReviewRequestDto;
import com.printcraft.printcraft_backend.Reviews.DTO.ReviewResponseDto;
import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.repository.ProductRepository;
import com.printcraft.printcraft_backend.user.domain.User;
import com.printcraft.printcraft_backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {
    //we need repository
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public ReviewService(UserRepository userRepository, ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }
    @Transactional
    public ReviewResponseDto submitReviewMethod(ReviewRequestDto reviewRequestDto,String phoneNo){
        //we need phoneno will extract it from jwt token to autheticate user
        User user =userRepository.findByphoneNo(phoneNo).orElseThrow(()->new RuntimeException("User not found"));
        //we need to find the product of which review is given
        Product product = productRepository.findById(Long.valueOf(reviewRequestDto.getProductId())).orElseThrow(()->
                new RuntimeException("Product not found"));
//        //Prevent duplicate review
        if(reviewRepository.existsByUserIdAndProductId(user.getId(),product.getId())){
            throw new RuntimeException("You have already reviewed this product");
        }
        //now build the review -- Build and save review
        Reviews reviews = Reviews.builder().user(user)
                .product(product)
                .rating(reviewRequestDto.getRating())
                .comment(reviewRequestDto.getComment())
                .imageUrl(reviewRequestDto.getImageUrl())  // URL from FileStorageService
                .build();
        //save it to the entity
        Reviews saved = reviewRepository.save(reviews);
        //Return responseDto
        return mapToDTO(saved);
    }

    private ReviewResponseDto mapToDTO(Reviews saved) {
        return ReviewResponseDto.builder()
                .id(saved.getId())
                .username(saved.getUser().getName())
                .rating(saved.getRating())
                .comment(saved.getComment())
                .imageUrl(saved.getImageUrl())
                .createdAt(saved.getCreatedAt())
                .build();
    }
    //// Get all reviews for a product
    public List<ReviewResponseDto> getAllReviewsOnProduct(Long productId){
        return reviewRepository.findByProductId(productId).stream().map(this::mapToDTO).toList();
    }
}
