package com.printcraft.printcraft_backend.order.repository;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface OrderRepository extends JpaRepository<Order,Long>, JpaSpecificationExecutor<Order> {
    //who ordered it
    List<Order> findByUser(User user);
    Optional<Order> findBypaymentId(String paymentId);

}
