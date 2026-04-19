package com.printcraft.printcraft_backend.payment.service;

import com.printcraft.printcraft_backend.order.domain.Order;
import com.printcraft.printcraft_backend.order.domain.OrderStatus;
import com.printcraft.printcraft_backend.order.repository.OrderRepository;
import com.printcraft.printcraft_backend.payment.domain.PaymentStatus;
import com.printcraft.printcraft_backend.payment.dto.PaymentResponseDTO;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;


@Service
public class PaymentService {
    private final OrderRepository orderRepository;

    public PaymentService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
    // Injecting values from application.properties
    @Value("${razorpay.key.id}")
    private String razorKey;

    @Value("${razorpay.key.secret}")
    private String razorSecret;    //used to verify webhook signatures
    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;  //original client registration


    public PaymentResponseDTO createPaymentOrder(Long orderId){
//    fetch order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
//        validate
        if (order.getPaymentId() != null) {
            throw new RuntimeException("Payment already initiated for this order");
        }
       if(!order.getPaymentStatus().equals(PaymentStatus.PENDING)){
           throw new RuntimeException("Order already paid or invalid");
       }
       //placing operation - proceeding with payment function
        try{
            //convert amount to paisa
            int amount = order.getFinalPrice()
                    .multiply(BigDecimal.valueOf(100))
                    .intValueExact();
          //create rajorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorKey,razorSecret);
            //prepare propar JSON Body
            JSONObject paymentData = new JSONObject();
            paymentData.put("amount",amount);
            paymentData.put("currency","INR"); //INDIAN RUPEES CURRENCY
            paymentData.put("receipt", "order_" + order.getId()); //receipt attached with orderId
            //create order proceeding
            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(paymentData); //response object from Razorpay API
//            NOTE:-> Razorpay SDK:-> Makes HTTP request to Razorpay server AND Sends JSON:
            // Save Razorpay Order ID in DB -->  actually storing razorpay_order_id
            order.setPaymentId(razorpayOrder.get("id"));
            //save in db now
            orderRepository.save(order);
            //return response
         return PaymentResponseDTO.builder()
                 .razorpayOrderId(razorpayOrder.get("id"))
                 .razorpayPublicKey(razorKey)
                 .amount((long) amount)
                 .currency("INR")
                 .build();
        }catch (RazorpayException razorpayException){
            // Handle the specific Razorpay error (e.g., bad API keys)
            throw new RuntimeException("Razorpay initialization failed: " + razorpayException.getMessage());
        }
        catch (Exception e) {
            throw new RuntimeException("Payment creation failed: " + e.getMessage(), e);
        }

}
    public void handleWebhook(String payload, String signature) {

        try {
            boolean isValid = com.razorpay.Utils.verifyWebhookSignature(payload, signature, webhookSecret);


            if (!isValid) {
                throw new RuntimeException("Invalid webhook signature");
            }

            JSONObject event = new JSONObject(payload);
            String eventType = event.getString("event");

            if ("payment.captured".equals(eventType)) {

                JSONObject paymentEntity = event
                        .getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");

                String razorpayOrderId = paymentEntity.getString("order_id");

                // 🔥 Find your order using paymentId
                Order order = orderRepository.findBypaymentId(razorpayOrderId)
                        .orElseThrow(() -> new RuntimeException("Order not found"));

                // ✅ Update order
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setOrderStatus(OrderStatus.CONFIRMED);

                orderRepository.save(order);

                // 👉 CALL EMAIL SERVICE HERE (non-blocking ideally)
            }

        } catch (Exception e) {
            throw new RuntimeException("Webhook processing failed: " + e.getMessage());
        }
    }
}



//1. Fetch order from YOUR DB
//2. Validate it's unpaid
//        3. Convert ₹ → paisa
//4. Tell Razorpay:
//        "Create a payment order for this amount"
//        5. Razorpay returns THEIR order ID
//6. You store that ID
//7. You send it to frontend
