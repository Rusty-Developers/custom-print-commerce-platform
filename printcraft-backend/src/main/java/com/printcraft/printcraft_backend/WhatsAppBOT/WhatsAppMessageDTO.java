package com.printcraft.printcraft_backend.WhatsAppBOT;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WhatsAppMessageDTO {
    private String message;
}
