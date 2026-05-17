package com.printcraft.printcraft_backend.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.printcraft.printcraft_backend.order.domain.*;
import com.printcraft.printcraft_backend.order.repository.OrderModificationRequestRepository;
import com.printcraft.printcraft_backend.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderNotication {
    private final OrderRepository orderRepository;
    private final OrderModificationRequestRepository orderModificationRequestRepository;

    private Order order;

    public OrderNotication(OrderRepository orderRepository, OrderModificationRequestRepository orderModificationRequestRepository) {
        this.orderRepository = orderRepository;
        this.orderModificationRequestRepository = orderModificationRequestRepository;
    }

    public OrderModificationRequest createModificationRequest(ModificationRequestDTO requestDTO,Long orderId) throws JsonProcessingException {
   //fetch order from orderRepo
        Order order = orderRepository.findById(orderId).orElseThrow(
                () ->  new RuntimeException("Order is not valid!")
        );
       // VALIDATE MODIFICATION WINDOW
        if(!order.getOrderStatus().equals(OrderStatus.MODIFICATION_ALLOWED)){
            throw new RuntimeException("modification is not allowed");
        }
        //build ModificationPayloadDTO
       //now field change
        FieldChange sizeChange = null;
        if(requestDTO.getNewSize()!=null){
           sizeChange =  FieldChange.builder().oldValue(
                    order.getProductSizeInches().name()).newValue(requestDTO.getNewSize()).build();
        }

        FieldChange frameChange = null;
        if(requestDTO.getNewFrame()!=null){
          frameChange =   FieldChange.builder().oldValue(order.getFrameTypes().name())
                    .newValue(requestDTO.getNewFrame()).build();
        }

        FieldChange thicknessChange = null;
        if(requestDTO.getNewThickness()!=null){
          thicknessChange =  FieldChange.builder().oldValue(order.getProductThickness().name())
                    .newValue(requestDTO.getNewThickness()).build();
        }
     //now we should build the DTO Which will help to save in entity-audit
        ModificationPayloadDTO payloadDTO = ModificationPayloadDTO.builder()
                .size(sizeChange)
                .frame(frameChange)
                .thickness(thicknessChange)
                .build();

        //now we will convert this java-object into json format by usuing HIGH-PERFOMANCE JACKSON LIBRARY//JSON PROCESSOR
        //SO , WE WILL DO  Serialization, Java Object  →  JSON string
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(payloadDTO);
        //now create entity
        OrderModificationRequest orderModificationRequest = OrderModificationRequest.builder()
                .order(order)
                .requestedChanges(json)
                .orderBotReplyStatus(OrderBotReplyStatus.PENDING)
                .adminAcknowledged(false)
                .user(order.getUser())
                .build();
        //save in repo
        orderModificationRequestRepository.save(orderModificationRequest);
        //return entity
        return orderModificationRequest;
    }
}
