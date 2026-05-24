package com.printcraft.printcraft_backend.order.repository;

import com.printcraft.printcraft_backend.Admin.AdminModificationResponseDTO;
import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderBotReplyStatus;
import com.printcraft.printcraft_backend.order.domain.OrderModificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderModificationRequestRepository extends JpaRepository<OrderModificationRequest,Long> {
   List<OrderModificationRequest> findByOrderBotReplyStatus(
           OrderBotReplyStatus botReplyStatus
   );
}
