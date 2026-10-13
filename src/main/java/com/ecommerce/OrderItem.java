package com.ecommerce;

public class OrderItem {
    private Products product;
    private int quantity;

    OrderItem(Products product, int quantity) {
        this.product = product;
        this.quantity = quantity;
    }

    public OrderItem() {}

    public void setProduct(Products product) {
        this.product = product;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public Products getProduct() {
        return product;
    }

    public int getQuantity() {
        return quantity;
    }
}