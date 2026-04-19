package com.printcraft.printcraft_backend.product.service;

import com.printcraft.printcraft_backend.Admin.CreateProductRequestDTO;
import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsProductActiveTrue();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    //creating product by Admin
    public  Product createProduct(CreateProductRequestDTO createProductRequest){
        Product product = Product.builder()
                .productName(createProductRequest.getProductName())
                .productCatagories(createProductRequest.getProductCatagories())
                .description(createProductRequest.getDescription())
                .frameTypes(createProductRequest.getFrameTypes())
                .imageUrl(createProductRequest.getImageUrl())
                .build();
        return productRepository.save(product);
    }

//after creating product save as active of that product
    public void toggleProductStatus(Long id) {
       Product product = getProductById(id);
       product.setProductActive(!product.isProductActive());
       productRepository.save(product);
    }
}
