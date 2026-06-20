package com.printcraft.printcraft_backend.user.service;

import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryEntity;
import com.printcraft.printcraft_backend.DeliveryTracking.DeliveryRepository;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.EventDTO;
import com.printcraft.printcraft_backend.DeliveryTracking.dto.UserTrackingDTO;
import com.printcraft.printcraft_backend.GlobalExceptionHandler.GlobalException.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserTrackingService {
    private final DeliveryRepository deliveryRepository;
    public UserTrackingService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }
    @Transactional
    public UserTrackingDTO getByOrderId(Long orderId) {
        //here, we will handle logic layer
        DeliveryEntity deliveryEntity =
                deliveryRepository.findByOrderId(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with orderId: " + orderId
                                ));
//calling converttolist method
        List<EventDTO> eventDTOList = convertToList(deliveryEntity);
        return new UserTrackingDTO(deliveryEntity.getOrder().getId(),
                deliveryEntity.getDeliveryStatus(),
                deliveryEntity.getCurrentLocation(),
                deliveryEntity.getEstimatedDeliveryDate()!=null?deliveryEntity.getEstimatedDeliveryDate().toLocalDate():null, //usuing ternary operator
                eventDTOList);
    }
    public List<EventDTO> convertToList(DeliveryEntity deliveryEntity){
        return deliveryEntity.getEvents()
                .stream()
                .map(event -> {
                    EventDTO dto = new EventDTO();
                    //structured mapping
                    dto.setStatus(event.getDeliveryStatus());
                    dto.setCurrentLocation(event.getLocation());
                    dto.setDescription(event.getDescription()); //optional but yaa useful !!
                    dto.setTimestamp(event.getTimestamp());
                    return dto;
                }).collect(Collectors.toList());
    }
}
