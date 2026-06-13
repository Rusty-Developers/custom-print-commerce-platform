package com.printcraft.printcraft_backend.Reviews;

import com.printcraft.printcraft_backend.product.domain.Product;
import com.printcraft.printcraft_backend.user.domain.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews")   //our DB - Table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reviews {
//    BIGINT PK
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE)
private Long id;
// Many users have Many reviews...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id")
//    user_id,BIGINT PK,BIGINT FK → users.id
    private User user;  //    user_id,BIGINT PK,BIGINT FK → users.id
    // one product  have Many reviews...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;//    BIGINT FK → products.id
    // Usuing Integer for simplicity; validation ensures 1-5.
    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "rating", nullable = false)
    private Integer rating;
    // What's missing:
    private String comment;      //  text review
    private String imageUrl;     //  review photo
//    private String videoUrl;     //  review video
    @CreationTimestamp
    private LocalDateTime createdAt; // ---- when reviewed
}
