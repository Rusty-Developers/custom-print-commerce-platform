package com.printcraft.printcraft_backend.product.service;

import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.domain.ProductPricing;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import com.printcraft.printcraft_backend.product.dto.request.ProductPricingRequestDTO;
import com.printcraft.printcraft_backend.product.dto.response.PricingCellResponseDTO;
import com.printcraft.printcraft_backend.product.repository.ProductPricingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service               // <-- WAS MISSING! Spring won't manage this bean without it
@RequiredArgsConstructor  // <-- Cleaner than manual constructor
public class PricingService {
//NOTE --->> price = f(Product, Size, Thickness)
    private final ProductPricingRepository productPricingRepository;
    //need to inject the product service
    private final ProductService productService; //needed to fetch Product by id
    @Transactional(readOnly = true)
    public BigDecimal getPrice(Product product,
                               ProductSizeInches size,
                               ProductThickness thickness) {

        ProductPricing pricing = productPricingRepository
                .findByProductAndProductSizeInchesAndProductThicknessAndIsActiveTrue(
                        product,
                        size,
                        thickness
                )
                .orElseThrow(() -> new RuntimeException("Pricing not found"));

        return pricing.getBasePrice();
    }
//    We need to answer one question every time admin saves a price:
//        "does a row already exist for this product+size+thickness?"
//
//    If yes → don't create a new row (that would violate your unique constraint and throw an error) — just update the existing row's price/active status.
//    If no → create a fresh row.  ------------ UPSERT  [UPDATE+INSERT BASED ON SITUATION]
    @Transactional
    public ProductPricing upSertPricing(Long productId, ProductPricingRequestDTO productPricingRequestDTO){
        //get the product
        Product product = productService.getProductById(productId);
        //after that get from repo
        ProductPricing pricing = productPricingRepository.findByProductAndProductSizeInchesAndProductThickness(product,
                productPricingRequestDTO.getProductSizeInches(),productPricingRequestDTO.getProductThickness()).orElse(
                        //or build//[insert]
                ProductPricing.builder()
                        .product(product)
                        .productSizeInches(productPricingRequestDTO.getProductSizeInches())
                        .productThickness(productPricingRequestDTO.getProductThickness())
                        .build()
        );
        // these two lines now run NO MATTER WHICH PATH we took — found or new
        pricing.setBasePrice(productPricingRequestDTO.getBasePrice());
        pricing.setActive(productPricingRequestDTO.isActive());
        return productPricingRepository.save(pricing);
    }
    @Transactional(readOnly = true)
//    Wrap the method in one transaction, so one session stays open for the entire method
//    — both queries happen inside it, and anything lazy stays reachable the whole time:
    public List<PricingCellResponseDTO> getPricingGridGrid(Long productId){
        // fetch all existing pricing rows for this product — ONE query, not 21
        Product product = productService.getProductById(productId);
        //now find out the pricing entity
        List<ProductPricing> existingProductRows = productPricingRepository.findByProduct(product);
        // index them by "size_thickness" so we can look each one up instantly .we here neede size*thickness
        Map<String,ProductPricing> bySizeAndThickness = existingProductRows.stream()
                .collect(Collectors.toMap(
                        r ->  r.getProductSizeInches()+ "_" + r.getProductThickness(),
                        r -> r
                ));
        List<PricingCellResponseDTO> grid = new ArrayList<>(); // we would inject data here
        for(ProductSizeInches sizeInches : ProductSizeInches.values()){
            for(ProductThickness productThickness : ProductThickness.values()){
                String key = sizeInches + "_" + productThickness;
                //use this as to get as key
                ProductPricing match = bySizeAndThickness.get(key);
                grid.add(PricingCellResponseDTO.builder()
                                .sizeInches(sizeInches)
                                .thickness(productThickness)
                                .basePrice(match != null ? match.getBasePrice() : null)
                                .isActive(match != null && match.isActive())
                                .isSet(match != null)
                        .build());
            }
        }
    return grid;
    }
    //CUSTOMER FACING API->
    public List<PricingCellResponseDTO> getAvailablePricing(Long productId) {
        List<PricingCellResponseDTO> listss = getPricingGridGrid(productId);
        // then filter: keep only cells where isSet == true AND isActive == true
      return   listss.stream().filter(obj-> obj.isActive()&& obj.isSet()).collect(Collectors.toList());
    }
}
