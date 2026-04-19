package com.printcraft.printcraft_backend.payment.controller;

import com.printcraft.printcraft_backend.payment.dto.PaymentResponseDTO;
import com.printcraft.printcraft_backend.payment.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {
    private final PaymentService paymentService;
//constructor injection
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
    //Create Razorpay Order
    @PostMapping("/create-order/{orderId}")
    public ResponseEntity<PaymentResponseDTO> createPaymentOrder(@PathVariable Long orderId){
        PaymentResponseDTO responseDTO = paymentService.createPaymentOrder(orderId);
        return ResponseEntity.ok(responseDTO);
    }
}
