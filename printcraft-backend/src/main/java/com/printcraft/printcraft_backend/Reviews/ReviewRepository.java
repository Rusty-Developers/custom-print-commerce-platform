package com.printcraft.printcraft_backend.Reviews;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Reviews,Long> {
    //usuing repo methods
    //// get all reviews for one product
    List<Reviews> findByProductIdOrderByCreatedAtDesc(Long productId);
    // check if user already reviewed this product
    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
