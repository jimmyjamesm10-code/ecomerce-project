package com.ecommerce;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.stereotype.Controller;

@Controller
public class ecomController {

    @GetMapping("/ecom")
    public String ecom() {
        return "ecom";
    }

    @GetMapping("/productdetails")
    public String productdets() {
        return "productdetails";
    }

    @GetMapping("/checkout")
    public String checkout() {
        return "checkout";
    }

    @GetMapping("/rollingcart")
    public String cart() {
        return "rollingcart";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }
    
}