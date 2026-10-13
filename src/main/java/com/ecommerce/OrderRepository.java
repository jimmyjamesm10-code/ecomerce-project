/*package com.ecommerce;
import java.util.List;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

public class OrderRepository {

    private final DataSource dataSource;

    public OrderRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void saveOrder(int userId, double total) {
        
        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("INSERT INTO orders (userId, total) VALUES (?, ?)");
        ) {
            statement.setInt(1, userId);
            statement.setDouble(2, total);
            statement.executeQuery();
        } 
    }

    public void extractOrderItems() {}

}*/