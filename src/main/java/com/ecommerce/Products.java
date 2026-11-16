package com.ecommerce;

import java.math.BigDecimal;

public class Products {
    private int id;
    private String name;
    private BigDecimal price;
    private int stock;
    private String category;
    private String image;

    Products(int id, String name, BigDecimal price, int stock, String category, String image) {
        this.id = id;
        this.name = name; 
        this.price = price;
        this.stock = stock;
        this.category = category;
        this.image = image;
    }

    public Products() {}

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public int getStock() {
        return stock;
    }

    public String getCategory() {
        return category;
    }

    public String getImage() {
        return image;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setImage(String image) {
        this.image = image;
    }
}