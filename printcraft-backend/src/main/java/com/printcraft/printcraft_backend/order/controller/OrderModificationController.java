package com.printcraft.printcraft_backend.order.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.printcraft.printcraft_backend.order.domain.ModificationRequestDTO;
import com.printcraft.printcraft_backend.order.domain.OrderModificationRequest;
import com.printcraft.printcraft_backend.order.service.OrderNotication;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class OrderModificationController {
    private final OrderNotication orderNotication;

    public OrderModificationController(OrderNotication orderNotication) {
        this.orderNotication = orderNotication;
    }

    @PostMapping("/orders/{orderId}/modify")
public ResponseEntity<OrderModificationRequest> orderModificaton(@RequestBody ModificationRequestDTO modificationRequestDTO,@PathVariable Long orderId) throws JsonProcessingException {
//calling service-layered
       OrderModificationRequest response = orderNotication.createModificationRequest(modificationRequestDTO,orderId);
       return ResponseEntity.ok(response);
}
}
