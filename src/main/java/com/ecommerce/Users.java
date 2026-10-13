package com.ecommerce;

public class Users {
    private String name;
    private String email;
    private String address;

    Users(String name, String email, String address) {
        this.name = name;
        this.email = email;
        this.address = address;
    } 

    Users() {}

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }
}