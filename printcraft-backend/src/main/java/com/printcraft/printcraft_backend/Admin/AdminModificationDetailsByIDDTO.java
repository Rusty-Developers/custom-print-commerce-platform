package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.order.domain.OrderBotReplyStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
@Data
@Builder
public class AdminModificationDetailsByIDDTO {
    private Long modificationRequestId;

    private Long orderId;

    private String username;

    private String email;

    private String currentSize;

    private String currentFrame;

    private String currentThickness;

    private String requestedChanges;

    private OrderBotReplyStatus status;

    private LocalDateTime createdAt;
}
