package com.ecommerce;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;


@Repository
public class ProductRepository {

    private final DataSource dataSource;

    public ProductRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<Products> getAllProducts() {

        ArrayList<Products> products = new ArrayList<>();

        try (
            Connection connection = dataSource.getConnection();
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT products.id, products.name, products.price, products.stock, products.image, categories.name AS category_name FROM products JOIN categories ON products.category_id = categories.id");
        ) {
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                double price = resultSet.getDouble("price");
                int stock = resultSet.getInt("stock");
                String category = resultSet.getString("category_name");
                String image = resultSet.getString("image");
                Products product = new Products(id, name, price, stock, category, image);
                products.add(product);
            } 
        } catch (Exception e) {

            e.printStackTrace();
        
        }
        return products;
    }


    public Products getProductById(int productId) {

        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("SELECT * FROM products WHERE id = ?")
        ) {
            statement.setInt(1, productId);
            try (            
                ResultSet resultSet = statement.executeQuery();
                PreparedStatement statement2 = connection.prepareStatement("SELECT name FROM categories WHERE id = ?")
            ) {
                while (resultSet.next()) {
                    int id = resultSet.getInt("id");
                    String name = resultSet.getString("name");
                    double price = resultSet.getDouble("price");
                    int stock = resultSet.getInt("stock");
                    int categoryId = resultSet.getInt("category_id");
                    String image = resultSet.getString("image");
                    statement2.setInt(1, categoryId);
                    try (
                        ResultSet resultSet2 = statement2.executeQuery()
                    ) {
                        while (resultSet2.next()) {
                            String category = resultSet2.getString("name");
                            Products product = new Products(id, name, price, stock, category, image);
                            return product;
                        }
                    }
                } 
            }
        } catch (Exception e) {

            e.printStackTrace();
        
        }
        
        return null;
    
    }

    public void decreaseProductStock(int purchasedQuant, int id) {

        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("UPDATE products SET stock = stock - ? WHERE id = ?") 
        ) {
            statement.setInt(1, purchasedQuant);
            statement.setInt(2, id);
            statement.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return; 
    }

    public void increaseProductStock(int reversedQuant, int id) {

        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("UPDATE products SET stock = stock + ? WHERE id = ?") 
        ) {
            statement.setInt(1, reversedQuant);
            statement.setInt(2, id);
            statement.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return;
    }


    public void SetProductStock(int newQuantity, int id) {

        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement = connection.prepareStatement("UPDATE products SET stock = ? WHERE id = ?");
        ) {
    
            statement.setInt(1, newQuantity);
            statement.setInt(2, id);
            statement.executeUpdate();
    
        } catch (Exception e) {
            
            e.printStackTrace();
        
        }

        return;
    }

    public void saveProductToDatabase(String name, double price, int stock, String category, String image) {


        try (
            Connection connection = dataSource.getConnection();
            PreparedStatement statement1 = connection.prepareStatement("SELECT id FROM categories WHERE name = ?");
            PreparedStatement statement = connection.prepareStatement("INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?, ?)");
        ) {
            statement1.setString(1, category);
            try (
                ResultSet resultSet = statement1.executeQuery()
            ) {
                while (resultSet.next()) {
                    int categoryId = resultSet.getInt("id");
                    statement.setString(1, name);
                    statement.setDouble(2, price);
                    statement.setInt(3, stock);
                    statement.setInt(4, categoryId);
                    statement.setString(5, image);
                    statement.executeUpdate();
                }
            }
        } catch (Exception e) {
            
            e.printStackTrace();
        
        }
    }
}