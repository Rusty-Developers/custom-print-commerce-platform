package com.printcraft.printcraft_backend.DeliveryTracking;

import com.printcraft.printcraft_backend.order.domain.Order;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    private Order order;
    private String trackingId;
    private String courierName;
    //delivery__status
    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus;
    private String currentLocation;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
//    IMP->One Delivery Order can have Many Events (status updates)
    //One delivery → Many events. That's why  @OneToMany matters here
    @OrderBy("timestamp ASC")
    @OneToMany(mappedBy = "deliveryEntity",fetch = FetchType.LAZY)
    private List<DeliveryEvent> events;
}
