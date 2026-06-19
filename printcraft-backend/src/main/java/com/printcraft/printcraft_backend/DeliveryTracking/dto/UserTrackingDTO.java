package com.printcraft.printcraft_backend.DeliveryTracking.dto;
import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryStatus;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
@Data
@Builder
@Getter
@Setter
public class UserTrackingDTO {
    private Long orderId;
    private DeliveryStatus currentStatus;
    private String location;
    private LocalDate estimatedDeliveryDate;
    private List<EventDTO> eventDTOS;
    //we need constructor to map DTO->
    public UserTrackingDTO(Long orderId, DeliveryStatus currentStatus, String location, LocalDate estimatedDeliveryDate,List<EventDTO> eventDTOS) {
    this.orderId=orderId;
      this.currentStatus=currentStatus;
      this.location=location;
      this.estimatedDeliveryDate=estimatedDeliveryDate;
      this.eventDTOS=eventDTOS;
    }
}
