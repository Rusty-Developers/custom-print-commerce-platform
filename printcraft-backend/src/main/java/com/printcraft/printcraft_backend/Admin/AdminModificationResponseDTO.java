package com.printcraft.printcraft_backend.Admin;

import com.printcraft.printcraft_backend.order.domain.OrderBotReplyStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminModificationResponseDTO {
    private Long modificationRequestId;

    private Long orderId;

    private String username;

    private String requestedChanges;

    private OrderBotReplyStatus status;

    private LocalDateTime createdAt;
}
