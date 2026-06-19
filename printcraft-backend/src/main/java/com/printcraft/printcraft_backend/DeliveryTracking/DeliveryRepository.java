package com.printcraft.printcraft_backend.DeliveryTracking;

import com.printcraft.printcraft_backend.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<DeliveryEntity,Long> {
    boolean existsByOrder(Order order);


    Optional<DeliveryEntity> getByOrder(Order order);
    Optional<DeliveryEntity> findByAwbCode(String awbCode);

    Optional<DeliveryEntity> findByOrderId(Long orderId);
}
