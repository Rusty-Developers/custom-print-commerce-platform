package com.printcraft.printcraft_backend.DeliveryTracking;

import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
//DeliveryEvent tells everything that happened -->
//👉 With it = real logistics system , can build analytics later (avg delivery time, bottlenecks),
// can debug issues (“why was it delayed?”),
// get audit logs (who changed what, when)+a real tracking timeline
public class DeliveryEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
//    NOTE:->“We use @ManyToOne because multiple delivery events (status updates) are associated with a single delivery,
//    forming a timeline of the delivery lifecycle.
    @ManyToOne
    private DeliveryEntity deliveryEntity;
    @Enumerated(EnumType.STRING)
    private DeliveryStatus deliveryStatus;

    private String location;

    private String description;

    private LocalDateTime timestamp;
}
//Like:
//
//Folder (Delivery)
//  ├── File1 (Event)
//  ├── File2 (Event)
//  ├── File3 (Event)