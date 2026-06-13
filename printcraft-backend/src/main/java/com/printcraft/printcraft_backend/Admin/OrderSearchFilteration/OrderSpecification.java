package com.printcraft.printcraft_backend.Admin.OrderSearchFilteration;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderStatus;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalTime;

public class OrderSpecification {
    //STATIC COZ->utility-style, call it without an object
    public static Specification<Order> hasStatus(OrderStatus orderStatus){
        return ((root, query, criteriaBuilder) -> orderStatus==null? criteriaBuilder.conjunction():criteriaBuilder.equal(root.get("orderStatus"),orderStatus));

    }
    //FOR PAYMENTSTATUS
    public static Specification<Order>  hasPaymentStatus(PaymentStatus paymentStatus){
        return ((root, query, criteriaBuilder) ->
                paymentStatus==null?criteriaBuilder.conjunction():criteriaBuilder.equal(root.get("PaymentStatus"),paymentStatus));
    }
    //for search through customername
    public static Specification<Order> hasCustomerName(String name) {
        return (root, query, cb) ->
                name == null ? cb.conjunction() : cb.like(
                        cb.lower(root.get("user").get("name")),
                        "%" + name.toLowerCase() + "%"
                );
    }
    //userID
    public static Specification<Order> hasUserId(Long userId) {
        return (root, query, cb) ->
                userId == null ? cb.conjunction() : cb.equal(root.get("user").get("id"), userId);
    }
  //ORDERID
    public static Specification<Order> hasOrderId(Long orderId) {
        return (root, query, cb) ->
                orderId == null ? cb.conjunction() : cb.equal(root.get("id"), orderId);
    }
    //date-ranging
    public static Specification<Order> betweenDates(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {

            if (from == null && to == null)
                return cb.conjunction();

            if (from == null)
                return cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        to.atTime(LocalTime.MAX)
                );
        /// /// LocalTime.MAX is simply the latest possible time in a day.
            if (to == null)
                return cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        from.atStartOfDay()
                );

            return cb.between(
                    root.get("createdAt"),
                    from.atStartOfDay(),
                    to.atTime(LocalTime.MAX)
            );
        };
    }
}
