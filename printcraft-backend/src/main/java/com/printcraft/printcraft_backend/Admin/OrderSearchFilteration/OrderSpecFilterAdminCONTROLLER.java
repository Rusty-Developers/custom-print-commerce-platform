package com.printcraft.printcraft_backend.Admin.OrderSearchFilteration;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderStatus;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class OrderSpecFilterAdminCONTROLLER {
    //injecting service
    private final OrderSpecFilterService orderSpecFilterService;

    public OrderSpecFilterAdminCONTROLLER(OrderSpecFilterService orderSpecFilterService) {
        this.orderSpecFilterService = orderSpecFilterService;
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> searchOrders(@RequestParam(required = false) OrderStatus orderStatus,
                                                    @RequestParam(required = false) PaymentStatus paymentStatus,
                                                    @RequestParam(required = false) String customer,
                                                    @RequestParam(required = false) Long userId,
                                                    @RequestParam(required = false) Long orderId,
                                                    @RequestParam(required = false) LocalDate from,
                                                    @RequestParam(required = false) LocalDate to){
        List<Order> orderBySpecs = orderSpecFilterService.searchOrders(orderStatus,paymentStatus,customer,userId,orderId,from,to);
        return ResponseEntity.ok(orderBySpecs);
    }
}
