package com.printcraft.printcraft_backend.Admin.OrderSearchFilteration;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderStatus;
import com.printcraft.printcraft_backend.order.repository.OrderRepository;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrderSpecFilterService {
    //injecting orderRepo
    private final OrderRepository orderRepository;

    public OrderSpecFilterService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> searchOrders(OrderStatus orderStatus, PaymentStatus paymentStatus,
                                    String customer, Long userId, Long orderId,
                                    LocalDate from, LocalDate to) {
//        Specification<Order> spec = OrderSpecification.hasStatus(orderStatus)
//        .and(OrderSpecification.hasPaymentStatus(paymentStatus))
//                .and(OrderSpecification.hasCustomerName(customer))
//                .and(OrderSpecification.hasUserId(userId))
//                .and(OrderSpecification.hasOrderId(orderId))
//                .and(OrderSpecification.betweenDates(from, to));


//  ------  ------>>>>> This is the modern Spring Data JPA 3.5+ approach and handles null specifications nicely.
        Specification<Order> spec = Specification.allOf(
                OrderSpecification.hasStatus(orderStatus),
                OrderSpecification.hasPaymentStatus(paymentStatus),
                OrderSpecification.hasCustomerName(customer),
                OrderSpecification.hasUserId(userId),
                OrderSpecification.hasOrderId(orderId),
                OrderSpecification.betweenDates(from, to)
        );

        return orderRepository.findAll(spec);
    }
}
