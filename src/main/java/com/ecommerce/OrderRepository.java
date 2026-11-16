package com.ecommerce;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.PreparedStatement;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;


@Repository
public class OrderRepository {

    private final DataSource dataSource;

    public OrderRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void saveOrder(Integer userId, BigDecimal total, String status) { 

        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement(
                """
                INSERT INTO orders (user_id, total, status, paystack_reference) 
                VALUES (?, ?, ?, NULL)
                """
            );
        ) {
            statement.setInt(1, userId);
            statement.setBigDecimal(2, total);
            statement.setString(3, status);
            statement.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Integer getOrderIdByUserId(Integer userId) {
        
        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement(
            """
                SELECT * FROM orders 
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT 1
            """
            );
        ) {
            statement.setInt(1, userId);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                Integer orderId = (Integer) resultSet.getInt("id");
                return orderId;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}