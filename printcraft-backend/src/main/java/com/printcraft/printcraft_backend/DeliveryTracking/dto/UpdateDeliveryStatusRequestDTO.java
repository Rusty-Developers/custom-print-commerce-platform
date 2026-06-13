package com.printcraft.printcraft_backend.DeliveryTracking.dto;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryStatus;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Getter
@Setter
public class UpdateDeliveryStatusRequestDTO {
    private String trackingId;
    private DeliveryStatus newStatus;
    private String location;
}
