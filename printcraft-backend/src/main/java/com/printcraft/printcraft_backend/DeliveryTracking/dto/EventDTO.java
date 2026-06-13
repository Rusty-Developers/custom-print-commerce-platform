package com.printcraft.printcraft_backend.DeliveryTracking.dto;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    //here, we would list our proper-strutured phase by phase detailing datas which users will see by fetching their orders
    private DeliveryStatus status;
    private  String description; //optional but needed
    private String currentLocation;
    private LocalDateTime timestamp;
}
