package com.printcraft.printcraft_backend.product.repository;

import com.printcraft.printcraft_backend.product.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product,Long> {
    //Checking existance
    List<Product> findByIsProductActiveTrue();
    Optional<Product> findByProductName(String productName);
}
