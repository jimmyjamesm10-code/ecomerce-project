package com.ecommerce;

public class UserLoginInfo {
    private String email;
    private String password;

    UserLoginInfo(String email, String password) {
        this.email = email;
        this.password = password;
    } 

    UserLoginInfo() {}

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }
}