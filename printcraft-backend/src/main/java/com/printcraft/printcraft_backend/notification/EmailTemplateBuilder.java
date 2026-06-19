package com.printcraft.printcraft_backend.notification;
import java.math.BigDecimal;

public class EmailTemplateBuilder {

    // ─────────────────────────────────────────
    // 1. ORDER CONFIRMED → User
    // ─────────────────────────────────────────
    public static String buildOrderConfirmed(
            String customerName,
            Long orderId,
            String productName,
            String size,
            String frame,
            String thickness,
            String borderColor,
            BigDecimal amountPaid,
            String deliveryAddress
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #1a1a2e; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 22px; }
                    .body { padding: 28px 32px; color: #333; }
                    .order-box { background: #f9f9f9; border: 1px solid #e0e0e0;
                                 border-radius: 6px; padding: 18px; margin: 20px 0; }
                    .order-box table { width: 100%%; border-collapse: collapse; }
                    .order-box td { padding: 6px 0; font-size: 14px; }
                    .order-box td:first-child { color: #666; width: 40%%; }
                    .amount { font-size: 20px; color: #2e7d32; font-weight: bold; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>🎉 Order Confirmed — PrintCraft</h1>
                  </div>
                  <div class="body">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your payment was successful and your order is confirmed. Here's a summary:</p>
                    <div class="order-box">
                      <table>
                        <tr><td>Order ID</td><td><strong>#%d</strong></td></tr>
                        <tr><td>Product</td><td>%s</td></tr>
                        <tr><td>Size</td><td>%s</td></tr>
                        <tr><td>Frame Type</td><td>%s</td></tr>
                        <tr><td>Thickness</td><td>%s</td></tr>
                        <tr><td>Border Color</td><td>%s</td></tr>
                        <tr><td>Delivery To -> </td><td>%s</td></tr>
                      </table>
                    </div>
                    <p>Amount Paid: <span class="amount">₹%s</span></p>
                    <p>We'll notify you when your order goes into production. Questions? Reply to this email.</p>
                    <p>— Team PrintCraft</p>
                  </div>
                  <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
                </div>
                </body>
                </html>
                """.formatted(
                customerName, orderId, productName,
                size, frame, thickness, borderColor,
                deliveryAddress, amountPaid.toPlainString()
        );
    }

    // ─────────────────────────────────────────
    // 2. NEW ORDER RECEIVED → Admin
    // ─────────────────────────────────────────
    public static String buildNewOrderAdmin(
            Long orderId,
            String customerName,
            String customerEmail,
            String productName,
            String size,
            String frame,
            String thickness,
            BigDecimal amount,
            String deliveryAddress
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #b71c1c; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .body { padding: 28px 32px; color: #333; }
                    .order-box { background: #f9f9f9; border: 1px solid #e0e0e0;
                                 border-radius: 6px; padding: 18px; margin: 20px 0; }
                    .order-box table { width: 100%%; border-collapse: collapse; }
                    .order-box td { padding: 6px 0; font-size: 14px; }
                    .order-box td:first-child { color: #666; width: 40%%; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>🛒 New Order Received — Action Required</h1>
                  </div>
                  <div class="body">
                    <p>A new order has been placed and payment confirmed.</p>
                    <div class="order-box">
                      <table>
                        <tr><td>Order ID</td><td><strong>#%d</strong></td></tr>
                        <tr><td>Customer</td><td>%s (%s)</td></tr>
                        <tr><td>Product</td><td>%s</td></tr>
                        <tr><td>Size</td><td>%s</td></tr>
                        <tr><td>Frame</td><td>%s</td></tr>
                        <tr><td>Thickness</td><td>%s</td></tr>
                        <tr><td>Amount</td><td><strong>₹%s</strong></td></tr>
                        <tr><td>Delivery To</td><td>%s</td></tr>
                      </table>
                    </div>
                    <p>Log in to the admin panel to begin processing.</p>
                  </div>
                  <div class="footer">PrintCraft Admin Notification</div>
                </div>
                </body>
                </html>
                """.formatted(
                orderId, customerName, customerEmail,
                productName, size, frame, thickness,
                amount.toPlainString(), deliveryAddress
        );
    }

    // ─────────────────────────────────────────
    // 3. MODIFICATION REQUEST → Admin
    // ─────────────────────────────────────────
    public static String buildModificationRequestAdmin(
            Long orderId,
            String customerName,
            String customerEmail,
            String requestedChanges,
            Long modificationRequestId
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #e65100; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .body { padding: 28px 32px; color: #333; }
                    .changes-box { background: #fff3e0; border-left: 4px solid #e65100;
                                   padding: 14px 18px; border-radius: 4px; font-family: monospace;
                                   font-size: 13px; margin: 16px 0; white-space: pre-wrap; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>⚠️ Order Modification Request</h1>
                  </div>
                  <div class="body">
                    <p><strong>Order #%d</strong> — %s (%s) has requested changes.</p>
                    <p>Modification Request ID: <strong>#%d</strong></p>
                    <p>Requested Changes:</p>
                    <div class="changes-box">%s</div>
                    <p>Log in to approve or reject this request.</p>
                  </div>
                  <div class="footer">PrintCraft Admin Notification</div>
                </div>
                </body>
                </html>
                """.formatted(
                orderId, customerName, customerEmail,
                modificationRequestId, requestedChanges
        );
    }

    // ─────────────────────────────────────────
    // 4. MODIFICATION APPROVED → User
    // ─────────────────────────────────────────
    public static String buildModificationApproved(
            String customerName,
            Long orderId,
            String newSize,
            String newFrame,
            String newThickness
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #2e7d32; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .body { padding: 28px 32px; color: #333; }
                    .info-box { background: #e8f5e9; border-left: 4px solid #2e7d32;
                                padding: 14px 18px; border-radius: 4px; margin: 16px 0; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>✅ Modification Approved</h1>
                  </div>
                  <div class="body">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Great news! Your modification request for Order <strong>#%d</strong> has been approved.</p>
                    <div class="info-box">
                      <strong>Updated Details:</strong><br/>
                      Size: %s<br/>
                      Frame: %s<br/>
                      Thickness: %s
                    </div>
                    <p>Your order will now proceed with these updated specifications.</p>
                    <p>— Team PrintCraft</p>
                  </div>
                  <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
                </div>
                </body>
                </html>
                """.formatted(customerName, orderId, newSize, newFrame, newThickness);
    }

    // ─────────────────────────────────────────
    // 5. MODIFICATION REJECTED → User
    // ─────────────────────────────────────────
    public static String buildModificationRejected(
            String customerName,
            Long orderId
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #c62828; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .body { padding: 28px 32px; color: #333; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>❌ Modification Request Rejected</h1>
                  </div>
                  <div class="body">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Unfortunately, your modification request for Order <strong>#%d</strong>
                       could not be accommodated at this stage.</p>
                    <p>Your order will proceed with the original specifications.
                       If you have concerns, please reply to this email and we'll assist you.</p>
                    <p>— Team PrintCraft</p>
                  </div>
                  <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
                </div>
                </body>
                </html>
                """.formatted(customerName, orderId);
    }

    // ─────────────────────────────────────────
    // 6. ORDER PROCESSING → User
    // ─────────────────────────────────────────
    public static String buildOrderProcessing(
            String customerName,
            Long orderId,
            String productName
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #1565c0; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .body { padding: 28px 32px; color: #333; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>🖨️ We're Working On Your Order!</h1>
                  </div>
                  <div class="body">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Your order <strong>#%d</strong> (<em>%s</em>) has entered the production stage.</p>
                    <p>Our team has started crafting your custom print. We'll send you another
                       email the moment it's shipped with your tracking details.</p>
                    <p>— Team PrintCraft</p>
                  </div>
                  <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
                </div>
                </body>
                </html>
                """.formatted(customerName, orderId, productName);
    }

    // ─────────────────────────────────────────
    // 7. ORDER SHIPPED → User (with tracking)
    // ─────────────────────────────────────────
    public static String buildOrderShipped(
            String customerName,
            Long orderId,
            String trackingId,
            String courierName
    ) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; }
                    .container { max-width: 600px; margin: 30px auto; background: #fff;
                                 border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #4a148c; color: #fff; padding: 24px 32px; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .body { padding: 28px 32px; color: #333; }
                    .tracking-box { background: #f3e5f5; border-left: 4px solid #4a148c;
                                    padding: 14px 18px; border-radius: 4px; margin: 20px 0; }
                    .tracking-id { font-size: 22px; font-weight: bold; color: #4a148c;
                                   letter-spacing: 1px; }
                    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                               color: #999; text-align: center; }
                  </style>
                </head>
                <body>
                <div class="container">
                  <div class="header">
                    <h1>🚚 Your Order Is On Its Way!</h1>
                  </div>
                  <div class="body">
                    <p>Hi <strong>%s</strong>,</p>
                    <p>Order <strong>#%d</strong> has been handed over to <strong>%s</strong>
                       and is now on its way to you.</p>
                    <div class="tracking-box">
                      <p style="margin:0 0 6px 0; color:#666; font-size:13px;">Your Tracking ID</p>
                      <div class="tracking-id">%s</div>
                    </div>
                    <p>Use the tracking ID on the courier's website to follow your shipment in real time.</p>
                    <p>— Team PrintCraft</p>
                  </div>
                  <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
                </div>
                </body>
                </html>
                """.formatted(customerName, orderId, courierName, trackingId);
    }
    //email for OUT_FOR_DELIVERY
    public static String buildOutForDelivery(
            String customerName,
            Long orderId,
            String courierName,
            String currentLocation
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background:#f4f4f4; }
                .container { max-width:600px; margin:30px auto; background:#fff;
                             border-radius:8px; overflow:hidden;
                             box-shadow:0 2px 8px rgba(0,0,0,0.1);}
                .header { background:#ef6c00; color:#fff; padding:24px 32px; }
                .body { padding:28px 32px; color:#333; }
                .status-box {
                    background:#fff3e0;
                    border-left:4px solid #ef6c00;
                    padding:16px;
                    margin:20px 0;
                    border-radius:4px;
                }
                .footer {
                    background:#f4f4f4;
                    padding:16px 32px;
                    font-size:12px;
                    color:#999;
                    text-align:center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📦 Out For Delivery</h1>
                </div>

                <div class="body">
                  <p>Hi <strong>%s</strong>,</p>

                  <p>Your PrintCraft order <strong>#%d</strong> is now out for delivery and is expected to arrive today.</p>

                  <div class="status-box">
                    <strong>Courier Partner:</strong> %s<br/>
                    <strong>Current Location:</strong> %s
                  </div>

                  <p>Please ensure someone is available at the delivery address to receive the package.</p>

                  <p>Thank you for choosing PrintCraft.</p>

                  <p>— Team PrintCraft</p>
                </div>

                <div class="footer">
                  PrintCraft · mkgroupprinting@gmail.com
                </div>
              </div>
            </body>
            </html>
            """.formatted(customerName, orderId, courierName, currentLocation);
    }
    //email for DELIVERED
    public static String buildDelivered(
            String customerName,
            Long orderId
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background:#f4f4f4; }
                .container { max-width:600px; margin:30px auto; background:#fff;
                             border-radius:8px; overflow:hidden;
                             box-shadow:0 2px 8px rgba(0,0,0,0.1);}
                .header { background:#2e7d32; color:#fff; padding:24px 32px; }
                .body { padding:28px 32px; color:#333; }
                .success-box {
                    background:#e8f5e9;
                    border-left:4px solid #2e7d32;
                    padding:16px;
                    margin:20px 0;
                    border-radius:4px;
                }
                .footer {
                    background:#f4f4f4;
                    padding:16px 32px;
                    font-size:12px;
                    color:#999;
                    text-align:center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Order Delivered Successfully</h1>
                </div>

                <div class="body">
                  <p>Hi <strong>%s</strong>,</p>

                  <div class="success-box">
                    Your order <strong>#%d</strong> has been successfully delivered.
                  </div>

                  <p>We hope you love your PrintCraft product.</p>

                  <p>If you have any questions, concerns, or feedback regarding your order, simply reply to this email and our support team will be happy to assist you.</p>

                  <p>Thank you for placing your trust in PrintCraft.</p>

                  <p>— Team PrintCraft</p>
                </div>

                <div class="footer">
                  PrintCraft · mkgroupprinting@gmail.com
                </div>
              </div>
            </body>
            </html>
            """.formatted(customerName, orderId);
    }
    //email for FAILED
    public static String buildDeliveryFailed(
            String customerName,
            Long orderId,
            String failureReason
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background:#f4f4f4; }
                .container { max-width:600px; margin:30px auto; background:#fff;
                             border-radius:8px; overflow:hidden;
                             box-shadow:0 2px 8px rgba(0,0,0,0.1);}
                .header { background:#c62828; color:#fff; padding:24px 32px; }
                .body { padding:28px 32px; color:#333; }
                .warning-box {
                    background:#ffebee;
                    border-left:4px solid #c62828;
                    padding:16px;
                    margin:20px 0;
                    border-radius:4px;
                }
                .footer {
                    background:#f4f4f4;
                    padding:16px 32px;
                    font-size:12px;
                    color:#999;
                    text-align:center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⚠️ Delivery Attempt Unsuccessful</h1>
                </div>

                <div class="body">
                  <p>Hi <strong>%s</strong>,</p>

                  <p>We were unable to complete the delivery of your order <strong>#%d</strong>.</p>

                  <div class="warning-box">
                    <strong>Reason:</strong> %s
                  </div>

                  <p>Our delivery partner may attempt delivery again. If any action is required from your side, our support team will contact you shortly.</p>

                  <p>If you believe this was a mistake, please reply to this email.</p>

                  <p>— Team PrintCraft</p>
                </div>

                <div class="footer">
                  PrintCraft · mkgroupprinting@gmail.com
                </div>
              </div>
            </body>
            </html>
            """.formatted(customerName, orderId, failureReason);
    }
    // ─────────────────────────────────────────
// 8. IN TRANSIT → User
// ─────────────────────────────────────────
    public static String buildInTransit(
            String customerName,
            Long orderId,
            String courierName,
            String trackingId
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 30px auto; background: #fff;
                             border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #01579b; color: #fff; padding: 24px 32px; }
                .header h1 { margin: 0; font-size: 20px; }
                .body { padding: 28px 32px; color: #333; }
                .tracking-box { background: #e1f5fe; border-left: 4px solid #01579b;
                                padding: 16px 18px; border-radius: 4px; margin: 20px 0; }
                .tracking-id { font-size: 20px; font-weight: bold; color: #01579b;
                               letter-spacing: 1px; margin-top: 6px; }
                .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                           color: #999; text-align: center; }
              </style>
            </head>
            <body>
            <div class="container">
              <div class="header">
                <h1>📍 Your Order Is in Transit</h1>
              </div>
              <div class="body">
                <p>Hi <strong>%s</strong>,</p>
                <p>Good news! Order <strong>#%d</strong> has been picked up by <strong>%s</strong>
                   and is currently moving through the delivery network.</p>
                <div class="tracking-box">
                  <p style="margin: 0 0 4px 0; color: #555; font-size: 13px;">Tracking ID</p>
                  <div class="tracking-id">%s</div>
                </div>
                <p>You can use the tracking ID on the courier's website to monitor your shipment in real time.
                   Estimated delivery is typically within 2–5 business days from dispatch.</p>
                <p>We'll send you another notification when your order is out for delivery.</p>
                <p>— Team PrintCraft</p>
              </div>
              <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
            </div>
            </body>
            </html>
            """.formatted(customerName, orderId, courierName, trackingId);
    }

    // ─────────────────────────────────────────
// 9. RTO INITIATED → User
// ─────────────────────────────────────────
    public static String buildRtoInitiated(
            String customerName,
            Long orderId
    ) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 30px auto; background: #fff;
                             border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #e65100; color: #fff; padding: 24px 32px; }
                .header h1 { margin: 0; font-size: 20px; }
                .body { padding: 28px 32px; color: #333; }
                .warning-box { background: #fff3e0; border-left: 4px solid #e65100;
                               padding: 16px 18px; border-radius: 4px; margin: 20px 0; }
                .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px;
                           color: #999; text-align: center; }
              </style>
            </head>
            <body>
            <div class="container">
              <div class="header">
                <h1>🔄 Your Order Is Being Returned</h1>
              </div>
              <div class="body">
                <p>Hi <strong>%s</strong>,</p>
                <p>We're sorry to inform you that Order <strong>#%d</strong> could not be delivered
                   after multiple attempts, and a Return to Origin (RTO) has been initiated.</p>
                <div class="warning-box">
                  Your order is now on its way back to our facility. Once received,
                  our support team will reach out to you regarding next steps,
                  including re-shipment or a refund as applicable.
                </div>
                <p>If you believe this was an error or would like to arrange re-delivery,
                   please reply to this email as soon as possible and we'll do our best to assist you.</p>
                <p>We apologise for the inconvenience caused.</p>
                <p>— Team PrintCraft</p>
              </div>
              <div class="footer">PrintCraft · mkgroupprinting@gmail.com</div>
            </div>
            </body>
            </html>
            """.formatted(customerName, orderId);
    }
}