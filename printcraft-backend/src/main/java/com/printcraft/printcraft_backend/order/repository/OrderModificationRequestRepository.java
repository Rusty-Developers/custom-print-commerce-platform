package com.printcraft.printcraft_backend.order.repository;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderModificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderModificationRequestRepository extends JpaRepository<OrderModificationRequest,Long> {
}
