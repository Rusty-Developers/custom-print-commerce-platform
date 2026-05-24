package com.printcraft.printcraft_backend.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.printcraft.printcraft_backend.Admin.AdminModificationDetailsByIDDTO;
import com.printcraft.printcraft_backend.Admin.AdminModificationResponseDTO;
import com.printcraft.printcraft_backend.order.domain.*;
import com.printcraft.printcraft_backend.order.repository.OrderModificationRequestRepository;
import com.printcraft.printcraft_backend.order.repository.OrderRepository;
import com.printcraft.printcraft_backend.product.domain.FrameTypes;
import com.printcraft.printcraft_backend.product.domain.ProductSizeInches;
import com.printcraft.printcraft_backend.product.domain.ProductThickness;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderNotication {
    private final OrderRepository orderRepository;
    private final OrderModificationRequestRepository orderModificationRequestRepository;

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
   @Transactional
    public void approveModification(long id) throws JsonProcessingException {
        //fetch order modification request
        OrderModificationRequest orderModification = orderModificationRequestRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Order Modification request not found with id: " + id));
       // only pending can be approved
       if(orderModification.getOrderBotReplyStatus() != OrderBotReplyStatus.PENDING){
           throw new RuntimeException("Request already processed");
       }
       // fetch actual order
       Order order = orderModification.getOrder();
       // validate order status
       if(order.getOrderStatus()!=OrderStatus.MODIFICATION_ALLOWED){
           throw new RuntimeException("Modification window closed");
       }
       //get json as string format
       String json = orderModification.getRequestedChanges();
       //Deserialize JSON
       ObjectMapper mapper = new ObjectMapper();
       ModificationPayloadDTO payloadDTO = mapper.readValue(json,ModificationPayloadDTO.class);
       //update order with propar checking
       if(payloadDTO.getSize() != null){
           order.setProductSizeInches(
                   ProductSizeInches.valueOf(payloadDTO.getSize().getNewValue())
           );
       }

       if(payloadDTO.getFrame() != null){
           order.setFrameTypes(
                   FrameTypes.valueOf(payloadDTO.getFrame().getNewValue())
           );
       }
       if(payloadDTO.getThickness()!=null){
           order.setProductThickness(ProductThickness.valueOf(payloadDTO.getThickness().getNewValue()));
       }
       // mark request approved in orderstateStatus and adminaknowledge true---
      orderModification.setOrderBotReplyStatus(OrderBotReplyStatus.APPROVED);
       //Admin acknowledgement
       orderModification.setAdminAcknowledged(true);
       //save into order repo
       orderRepository.save(order);
       //also save the recent modification
       orderModificationRequestRepository.save(orderModification);

   }
//pendingRequest method to surve to Admin very very crucial:
public List<AdminModificationResponseDTO> getPendingRequests() {

    List<OrderModificationRequest> pendingRequests =
            orderModificationRequestRepository
                    .findByOrderBotReplyStatus(OrderBotReplyStatus.PENDING);

    return pendingRequests.stream()
            .map(request -> AdminModificationResponseDTO.builder()
                    .modificationRequestId(request.getModificationRequestId())
                    .orderId(request.getOrder().getId())
                    .username(request.getUser().getName())
                    .requestedChanges(request.getRequestedChanges())
                    .status(request.getOrderBotReplyStatus())
                    .createdAt(request.getCreatedAt())
                    .build())
            .toList();
}

    public void rejectModification(long id) {
        ///FETCH ordermodificationrequest
        OrderModificationRequest orderModificationRequest = orderModificationRequestRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("No Modification-Request found for this ID")
        );
        if(orderModificationRequest.getOrderBotReplyStatus()!=OrderBotReplyStatus.PENDING){
            //nothing to do now!!
            throw new RuntimeException("NO REQUEST IS PENDING !!");
        }
        //now reject it
        orderModificationRequest.setOrderBotReplyStatus(OrderBotReplyStatus.REJECTED);
        orderModificationRequest.setAdminAcknowledged(true);
        //save into repo
        orderModificationRequestRepository.save(orderModificationRequest);
    }

    public AdminModificationDetailsByIDDTO getModificationDetailsByID(long id) {
        OrderModificationRequest request = orderModificationRequestRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("No requests ")
        );
        return AdminModificationDetailsByIDDTO.builder()
                .modificationRequestId(request.getModificationRequestId())
                .orderId(request.getOrder().getId())
                .username(request.getUser().getName())
                .email(request.getUser().getEmail())
                .currentSize(request.getOrder().getProductSizeInches().toString())
                .currentFrame(request.getOrder().getFrameTypes().toString())
                .currentThickness(request.getOrder().getProductThickness().toString())
                .requestedChanges(request.getRequestedChanges())
                .status(request.getOrderBotReplyStatus())
                .createdAt(request.getCreatedAt())
                .build();

    }
}
