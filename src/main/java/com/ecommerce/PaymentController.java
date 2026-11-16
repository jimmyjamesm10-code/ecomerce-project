package com.ecommerce;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.http.HttpSession;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    @Value("${paystack.secret-key}")
    private String paystackSecretKey;

    @Value("${paystack.callback-url}")
    private String paystackCallbackUrl;

    public PaymentController(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    @PostMapping("/verify/{orderId}")
    public ResponseEntity<?> verifyPayment(@PathVariable Integer orderId, HttpSession session) {

        //-------------retrieve-total-and-reference-from-database-------------
        BigDecimal total;
        String reference;
        String sql = """
            SELECT o.total, o.paystack_reference
            FROM orders o
            WHERE o.id = ?    
        """;
        Map<String, Object> orderPaymentInfo;
        try {
            orderPaymentInfo = jdbcTemplate.queryForMap(sql, orderId);
            total = (BigDecimal) orderPaymentInfo.get("total");
            reference = (String) orderPaymentInfo.get("paystack_reference");
        } catch (DataAccessException e) {
            System.err.println(e.getMessage());
            return ResponseEntity.internalServerError().body("order verification info could not be retrieved");
        }
        if (reference == null || reference.isBlank()) {
            return ResponseEntity.badRequest().body("payment reference does not exist for this order id");
        }
        //convert to cents
        long expectedAmount = total.multiply(new BigDecimal("100")).longValueExact();


        //---------request-transaction-reference-and-paid-amount-from-paystack---------------
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(paystackSecretKey);
        HttpEntity<Void> request = new HttpEntity<>(headers);
        String url = "https://api.paystack.co/transaction/verify/" + reference;
        Map<String, Object> paystackResponse;

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.GET, request, new ParameterizedTypeReference<Map<String, Object>>() {});
            paystackResponse = response.getBody();
        } catch (Exception e) {
            System.err.println(e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Could not verify payment with Paystack");
        }

        if (paystackResponse == null || !Boolean.TRUE.equals(paystackResponse.get("status"))) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("paystack verification failed");
        }

        Map<String, Object> payment = (Map<String, Object>) paystackResponse.get("data");

        if (payment == null) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Invalid verification response");
        }

        //--------compare-DB-reference-and-expected-total-with-retrieved-paystack-payment-info--------------
        boolean successful = "success".equals(payment.get("status"));
        boolean correctReference = reference.equals(payment.get("reference"));
        boolean correctCurrency = "ZAR".equals(payment.get("currency"));
        Object amountObject = payment.get("amount");
        boolean correctAmount = amountObject instanceof Number && ((Number) amountObject).longValue() == expectedAmount;
        
        if (!successful || !correctAmount || !correctReference || !correctCurrency) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Payment is unsuccessful or transaction details do not match");
        }

        //----------------everything-checks-out-update-DB-------------------

        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);

            try {
                try (PreparedStatement statement = connection.prepareStatement("""
                        UPDATE orders
                        SET status = 'PAID'
                        WHERE id = ? AND paystack_reference = ? AND status = 'PENDING'
                        """)) {
                    statement.setInt(1, orderId);
                    statement.setString(2, reference);

                    if (statement.executeUpdate() == 0) {
                        connection.rollback();
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body("Order was not updated. Check current status");
                    }
                }

                try (PreparedStatement statement = connection.prepareStatement("""
                        UPDATE order_items
                        SET status = 'PAID'
                        WHERE order_id = ? AND status = 'PENDING'
                        """)) {
                    statement.setInt(1, orderId);
                    statement.executeUpdate();
                }

                connection.commit();
            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Could not update order status");
        }

        //----------------update-inventory-after-successful-verification-------------
        Order order = (Order) session.getAttribute("order");
        String inventoryupdatesql = """
            UPDATE products
            SET stock = stock - ?
            WHERE id = ?
        """;
        List<OrderItem> order_items = order.getItems();
            try (
                Connection connection = dataSource.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement(inventoryupdatesql);
            ) {
                for (OrderItem item : order_items) {
                    Integer productid = item.getProduct().getId(); 
                    Integer quantity = item.getQuantity(); 
                
                    preparedStatement.setInt(1, quantity);
                    preparedStatement.setInt(2, productid);
                    preparedStatement.executeUpdate();
                }
            } catch (Exception e) {
                System.out.println(e.getMessage());
                e.printStackTrace();
                return ResponseEntity.internalServerError().body("could not update product stock");
            }

        //----------------------------------------------------------------------------
        return ResponseEntity.ok("Payment verified");
    }



    @PostMapping("/initialize/{orderId}")
    public ResponseEntity<?> initializePayment(@PathVariable Integer orderId) {

        if (orderId == null) {
            return ResponseEntity.badRequest().body("orderid is null");
        }

        //-------------use orderId to retrieve the order from DB----------
        String sql = """
            SELECT o.id, o.total, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
            """;
        Map<String, Object> order;

        try {
            order = jdbcTemplate.queryForMap(sql, orderId);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
        //------------------------------------------------------------------


        //------send orderinfo to paystack in http request------------------ 
        String email = (String) order.get("email");
        BigDecimal total = (BigDecimal) order.get("total");
        long amountInCents = total.multiply(new BigDecimal("100")).longValueExact();

        if (amountInCents <= 0) {
            return ResponseEntity.badRequest().body("Order total must be greater than zero");
        }
        //prepare http request configurations
        String callbackUrl = UriComponentsBuilder.fromUriString(paystackCallbackUrl)
            .queryParam("orderId", orderId)
            .build()
            .toUriString();
        Map<String, Object> requestBody = Map.of(
            "email", email,
            "amount", String.valueOf(amountInCents),
            "currency", "ZAR",
            "callback_url", callbackUrl
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(paystackSecretKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        //make http request to paystack
        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.paystack.co/transaction/initialize",
                request, 
                Map.class
            );

            Map<String, Object> paystackResponse = (Map<String, Object>) response.getBody();

            if (paystackResponse == null || !Boolean.TRUE.equals(paystackResponse.get("status"))) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Paystack could not initialize the payment");
            }

            Map<String, Object> data = (Map<String, Object>) paystackResponse.get("data");

            
            String reference = data.get("reference").toString();
            String refSql = """
                UPDATE orders
                SET paystack_reference = ?
                WHERE id = ?""";
                try (
                    Connection connection = dataSource.getConnection();
                    PreparedStatement preparedStatement = connection.prepareStatement(refSql);
                ) {
                    preparedStatement.setString(1, reference);
                    preparedStatement.setInt(2, orderId);
                    preparedStatement.executeUpdate();
                } catch (Exception e) {
                    System.err.println("Paystack reference was not saved: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Payment initialized, but an internal error occured.");
                }
            return ResponseEntity.ok(Map.of("authorization_url", data.get("authorization_url"), "reference", data.get("reference")));
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Could not connect to Paystack");

        }
    }
}