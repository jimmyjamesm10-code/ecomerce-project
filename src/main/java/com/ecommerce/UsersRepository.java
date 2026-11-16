package com.ecommerce;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import javax.sql.DataSource;
import java.util.Map;

import org.springframework.stereotype.Repository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Repository
public class UsersRepository {

    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;

    public UsersRepository(DataSource dataSource, PasswordEncoder passwordEncoder) {
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
    }


    public Users getUserByEmail(String Email) {

        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("SELECT * FROM users WHERE email = ?");
        ) {
            statement.setString(1, Email);
            try (
                ResultSet resultSet = statement.executeQuery();
            ) {
                if (resultSet.next()) {
                    String name = resultSet.getString("name");
                    String email = resultSet.getString("email");
                    String address = resultSet.getString("address");
                    String password = resultSet.getString("password");
                    Users user = new Users(name, email, address, password);
                    return user;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    } 

    public Map<String, Object> saveNewUser(String name, String email, String address, String password) {
        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("INSERT INTO users (name, email, address, password) VALUES (?, ?, ?, ?)");
        ) {
            statement.setString(1, name);
            statement.setString(2, email);
            statement.setString(3, address);
            statement.setString(4, passwordEncoder.encode(password));
            statement.executeUpdate();
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                System.out.println("email already exists");
                Map.of("status", false, "message", "email already exists");
            } else if ("42000".equals(e.getSQLState())) {
                System.out.println("user account could not be created");
                return Map.of("status", false, "message", "user account could not be created");
            } else {
                System.err.println("Database error:" + e.getMessage());
                return Map.of("status", false, "message", "user account could not be created");
            }
        }
        return Map.of("status" , true, "message", "user account created successfully");
    }

    public Integer getUserId(Users user) {
        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("SELECT id FROM users WHERE email = ?")
        ) {
            statement.setString(1, user.getEmail());
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                int id = resultSet.getInt("id");
                return id;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
}
