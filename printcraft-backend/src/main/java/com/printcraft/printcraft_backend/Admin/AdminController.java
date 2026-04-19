package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminController {
    private final ProductService productService;
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid@RequestBody CreateProductRequestDTO createProductRequest){
        Product product = productService.createProduct(createProductRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success",
                true,
                "productId",
                product.getId()
        ));
    }
    //updating for active status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        productService.toggleProductStatus(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
