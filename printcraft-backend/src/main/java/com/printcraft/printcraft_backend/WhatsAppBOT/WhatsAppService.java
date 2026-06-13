package com.printcraft.printcraft_backend.WhatsAppBOT;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.printcraft.printcraft_backend.order.domain.ModificationRequestDTO;
import com.printcraft.printcraft_backend.order.repository.OrderModificationRequestRepository;
import com.printcraft.printcraft_backend.order.service.OrderNotication;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class WhatsAppService {
    private final OrderNotication orderNotication;
    private final OrderModificationRequestRepository orderModificationRequestRepository;

    public WhatsAppService(OrderNotication orderNotication, OrderModificationRequestRepository orderModificationRequestRepository) {
        this.orderNotication = orderNotication;
        this.orderModificationRequestRepository = orderModificationRequestRepository;
    }

    public void processMessage(String message) throws JsonProcessingException {
        String[] splitByLines = message.split("\n");
        Long orderId = null;
        String size = null;
        String frame = null;
        String thickness = null;

        for (String s : splitByLines) {
            String line = s.trim();
            if (line.startsWith("ORDER_ID:")) {
                orderId = Long.parseLong(line.split(":", 2)[1].trim());
            } else if (line.startsWith("SIZE:")) {
                size = line.substring(5).trim();
            } else if (line.startsWith("FRAME:")) {
                frame = line.substring(6).trim();
            } else if (line.startsWith("THICKNESS:")) {
                thickness = line.substring(10).trim();
            }
        }
        log.info(size);
        log.info(thickness);
        log.info(frame);
        log.info("message -->" + message);
        log.info("ORDER ID --> {}", orderId);
        //convert DTO
        ModificationRequestDTO dto = ModificationRequestDTO.builder()
                .newSize(size)
                .newFrame(frame)
                .newThickness(thickness)
                .build();
        orderNotication.createModificationRequest(dto,orderId);

    }
}
