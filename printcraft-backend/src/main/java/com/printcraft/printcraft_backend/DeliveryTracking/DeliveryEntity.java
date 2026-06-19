package com.printcraft.printcraft_backend.DeliveryTracking;

import com.printcraft.printcraft_backend.order.domain.Order;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(indexes = @Index(name = "idx_awb_code", columnList = "awbCode"))
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
    private String awbCode;            // courier's tracking number → webhook lookup key
    private String shiprocketOrderId;  // Shiprocket's order reference
    private String shiprocketShipmentId; // needed for AWB assignment API call
    private int deliveryAttemptCount;  // track 1st, 2nd, 3rd attempt
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
