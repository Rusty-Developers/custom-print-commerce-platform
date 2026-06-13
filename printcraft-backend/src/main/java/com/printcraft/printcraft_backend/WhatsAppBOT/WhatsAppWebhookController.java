package com.printcraft.printcraft_backend.WhatsAppBOT;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhook/whatsapp")
public class WhatsAppWebhookController {
    //INJECTING SERVICE
    private final WhatsAppService whatsAppService;

    public WhatsAppWebhookController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }
    //whatsapp sends to backend
    @PostMapping("/postmessage")
    public ResponseEntity<?> recieveMessage(@RequestBody WhatsAppMessageDTO dto) throws JsonProcessingException {
        whatsAppService.processMessage(dto.getMessage());
        return ResponseEntity.ok("Message processed");
    }
}
