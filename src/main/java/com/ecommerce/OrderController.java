package com.ecommerce;

import jakarta.servlet.http.HttpSession;
import java.math.BigDecimal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.sql.DataSource;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;
import java.sql.SQLException;
import java.util.HashMap;



@RestController
@RequestMapping("/order")
public class OrderController {

    private final OrderRepository orderRepository;
    private final DataSource dataSource;

    public OrderController(OrderRepository orderRepository, DataSource dataSource) {
        this.orderRepository = orderRepository;
        this.dataSource = dataSource;
    }

   
    @PostMapping("/saveorderitems/{orderId}")
    public ResponseEntity<?> saveOrderItems(@PathVariable Integer orderId, @RequestBody Order order, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userid");
        List<OrderItem> orderItems = order.getItems();
        for (OrderItem item : orderItems) {
            Products product = item.getProduct();
            Integer quantity = item.getQuantity();
            Integer product_id = product.getId();
            BigDecimal product_price = product.getPrice();
            try (
                Connection connection = dataSource.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement(
                    """
                    INSERT INTO order_items (order_id, product_id, quantity, price, user_id, status)
                    VALUES (?, ?, ?, ?, ?, 'PENDING')    
                    """
                );
            ) {
                preparedStatement.setInt(1, orderId);
                preparedStatement.setInt(2, product_id);
                preparedStatement.setInt(3, quantity);
                preparedStatement.setBigDecimal(4, product_price);
                preparedStatement.setInt(5, userId);
                preparedStatement.executeUpdate();
            } catch (SQLException e) {
                System.err.println(e.getMessage());
                e.printStackTrace();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                return ResponseEntity.internalServerError().headers(headers).body(Map.of("message", e.getMessage()));
            }
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return ResponseEntity.status(200).headers(headers).body(Map.of("message", "orderItems saved"));
    }


    
    @PostMapping("/save")
    public ResponseEntity<?> order(@RequestBody Order order, HttpSession session) throws SQLException {
        Integer userId = (Integer) session.getAttribute("userid");
        session.setAttribute("order", order);
        System.out.println(userId);
        System.out.println(order);

        if (userId == null) {
            return ResponseEntity.status(401).body("please log in before placing an order");
        }

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> cartItems = order.getItems();
        for (OrderItem item : cartItems) {
            BigDecimal subtotal = item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(subtotal);
        }
        
        orderRepository.saveOrder(userId, total, "PENDING");

        Integer orderId = orderRepository.getOrderIdByUserId(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "order has been placed");
        response.put("orderId", orderId);
        return ResponseEntity.ok(response);
    }
}