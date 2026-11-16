package com.ecommerce;

import java.math.BigDecimal;
import java.util.List;

public class Order {
    private List<OrderItem> items;
    private BigDecimal total;

    Order(Users customerInfo, List<OrderItem> items, BigDecimal total) {
        this.items = items;
        this.total = total;
    }

    Order() {}


    public void setItems(List<OrderItem> items) {
        this.items = items;
    }  

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
    
    public List<OrderItem> getItems() {
        return items;
    } 

    public BigDecimal getTotal() {
        return total;
    }
}