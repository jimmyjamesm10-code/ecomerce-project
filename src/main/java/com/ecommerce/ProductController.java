package com.ecommerce;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;


@CrossOrigin(origins = "http://192.168.230.203:8080")
@RestController 
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/products") 
    public List<Products> getProducts() {
        return repository.getAllProducts();
    }

    @CrossOrigin(origins = "http://192.168.230.203:8080")
    @PostMapping("/order")
    public void updateProducts(@RequestBody Order order) {
        List<OrderItem> orderItems= order.getItems();
        orderItems.forEach(item -> {
            Products orderProduct = item.getProduct();
            int productId = orderProduct.getId();
            int quantity = item.getQuantity();
            repository.decreaseProductStock(quantity, productId);      
       });
    }

}