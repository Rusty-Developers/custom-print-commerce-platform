package com.printcraft.printcraft_backend.order.domain;

import com.printcraft.printcraft_backend.user.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_modification_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderModificationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long modificationRequestId;
    //which order -- user will contact with their order so one order-one notificationmodification
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "orders_id")
    private Order order;
    //what user wants--this will be required for the bot to undrstand the context strongly
    @Column(columnDefinition = "TEXT")
    private String requestedChanges;
    //status should be only->pending/approved/rejected
    @Enumerated(EnumType.STRING)
    private OrderBotReplyStatus orderBotReplyStatus;
    @Column(nullable = false)
    //admin acknowlged it
    private boolean adminAcknowledged;
    //admin needs to see the user
   @ManyToOne   //many request from one user
    @JoinColumn(name = "users_id")
    private User user;
    @CreationTimestamp
    //audit
    private LocalDateTime createdAt;
    //admin's response time
    private LocalDateTime processedAt;
}
