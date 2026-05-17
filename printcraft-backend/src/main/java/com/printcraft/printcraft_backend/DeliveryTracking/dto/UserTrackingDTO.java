package com.printcraft.printcraft_backend.DeliveryTracking.dto;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryEntity;
import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryStatus;
import com.printcraft.printcraft_backend.user.service.UserTrackingService;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Getter
@Setter
public class UserTrackingDTO {
    private String trackingId;
    private DeliveryStatus currentStatus;
    private String location;
    private LocalDate estimatedDeliveryDate;
    private List<EventDTO> eventDTOS;
    //we need constructor to map DTO->

    public UserTrackingDTO(String trackingId, DeliveryStatus currentStatus, String location, LocalDate estimatedDeliveryDate,List<EventDTO> eventDTOS) {
this.trackingId=trackingId;
this.currentStatus=currentStatus;
this.location=location;
this.estimatedDeliveryDate=estimatedDeliveryDate;
this.eventDTOS=eventDTOS;
    }
}
