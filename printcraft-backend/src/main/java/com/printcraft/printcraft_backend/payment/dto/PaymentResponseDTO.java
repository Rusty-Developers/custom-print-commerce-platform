package com.printcraft.printcraft_backend.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {
    private String razorpayOrderId;
    private String razorpayPublicKey;
    private Long amount;
    private String currency;
}
