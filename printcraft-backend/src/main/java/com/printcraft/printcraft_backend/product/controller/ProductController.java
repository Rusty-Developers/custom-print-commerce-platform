package com.printcraft.printcraft_backend.product.controller;

import com.printcraft.printcraft_backend.product.domain.Product;

import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import com.printcraft.printcraft_backend.product.service.PricingService;
import com.printcraft.printcraft_backend.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

private final  ProductService productService;
private final PricingService pricingService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllActiveProducts();
    }

    // Get product details by specific id
    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }
    //getAllpricesByProductID
    @GetMapping("/pricing/{id}")
    public ResponseEntity<?> getPricing(
            @PathVariable Long id,
            @RequestParam ProductSizeInches productSizeInches,
            @RequestParam ProductThickness productThickness
            ){
        //get find the product first from DB By calling it's id
        Product product = productService.getProductById(id);
        BigDecimal price = pricingService.getPrice(product,productSizeInches,productThickness);
        //return response
        return ResponseEntity.ok(Map.of(
                "productId",id,
                "productSizeInches",productSizeInches,
                "thickness",productThickness,
                "price",price
        ));
    }

}
