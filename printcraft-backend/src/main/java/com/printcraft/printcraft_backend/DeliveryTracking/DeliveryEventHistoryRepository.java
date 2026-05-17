package com.printcraft.printcraft_backend.DeliveryTracking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryEventHistoryRepository extends JpaRepository<DeliveryEvent,Long> {
    Optional<DeliveryEvent> findTopByDeliveryEntityOrderByTimestampDesc(DeliveryEntity deliveryEntity);

}
