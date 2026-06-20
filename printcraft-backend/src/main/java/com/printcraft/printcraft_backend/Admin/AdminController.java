package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductPricing;
import com.printcraft.printcraft_backend.product.dto.request.ProductPricingRequestDTO;
import com.printcraft.printcraft_backend.product.dto.response.PricingCellResponseDTO;
import com.printcraft.printcraft_backend.product.service.PricingService;
import com.printcraft.printcraft_backend.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminController {
    private final ProductService productService;
    private final PricingService pricingService;
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
    //update/insert Pricing
    @PutMapping("/{id}/pricing")
    public ResponseEntity<?> upsertPricing(
            @PathVariable Long id,
            @Valid @RequestBody ProductPricingRequestDTO productPricingRequestDTO) {

        ProductPricing saved = pricingService.upSertPricing(id, productPricingRequestDTO);

        return ResponseEntity.ok(Map.of(
                "productId", id,
                "size", saved.getProductSizeInches(),
                "thickness", saved.getProductThickness(),
                "basePrice", saved.getBasePrice(),
                "isActive", saved.isActive()
        ));
    }
    //pricing-grd controller
    @GetMapping("/{id}/pricing-grid")
    public ResponseEntity<List<PricingCellResponseDTO>> getPricingGrid(@PathVariable Long id) {
        List<PricingCellResponseDTO> grid = pricingService.getPricingGridGrid(id);
        return ResponseEntity.ok(grid);
    }
}
