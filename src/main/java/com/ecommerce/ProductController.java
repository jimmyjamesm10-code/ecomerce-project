package com.ecommerce;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;



@RestController 
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/getall") 
    public List<Products> getProducts() {
        return productRepository.getAllProducts();
    }


    @PostMapping("/update")
    public void Order(@RequestBody Order order) {
        List<OrderItem> orderItems= order.getItems();
        orderItems.forEach(item -> {
            Products orderProduct = item.getProduct();
            int productId = orderProduct.getId();
            int quantity = item.getQuantity();
            productRepository.decreaseProductStock(quantity, productId);      
       });
       return;
    }

}