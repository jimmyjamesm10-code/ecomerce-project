package com.ecommerce;

import java.util.List;

public class Order {
    private Users customerInfo;
    private List<OrderItem> items;
    private double total;

    Order(Users customerInfo, List<OrderItem> items, double total) {
        this.customerInfo = customerInfo;
        this.items = items;
        this.total = total;
    }

    Order() {}

    public void setCustomerInfo(Users customerInfo) {
        this.customerInfo = customerInfo;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }  

    public void setTotal(double total) {
        this.total = total;
    }
    
    public List<OrderItem> getItems() {
        return items;
    }
}