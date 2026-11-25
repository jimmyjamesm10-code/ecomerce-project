package com.ecommerce;

import org.springframework.web.bind.annotation.PostMapping;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import org.springframework.http.*;
import java.sql.SQLException;

import org.springframework.security.crypto.password.PasswordEncoder;


@RestController 
public class UserController {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registration")
    public ResponseEntity<Map<String, String>> saveUser(@RequestBody Users user) {
        try {
            Map<String, Object> userSaved = usersRepository.saveNewUser(user.getName(), user.getEmail(), user.getAddress(), user.getPassword());
            String message = (String) userSaved.get("message");
            if (Boolean.TRUE.equals(userSaved.get("status"))) {
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
            } else {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Registration failed"));
        } 
    }

    @PostMapping("/loginrequest")
    public ResponseEntity<?> login(@RequestBody UserLoginInfo loginRequest, HttpSession session) throws SQLException {
        Users user = usersRepository.getUserByEmail(loginRequest.getEmail());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (user == null) {
            return ResponseEntity.status(401).headers(headers).body(Map.of("message", "Invalid email or password. Please try again."));
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).headers(headers).body(Map.of("message", "Invalid email or password. Please try again."));
        }
        session.setAttribute("userid", usersRepository.getUserId(user));
        
        return ResponseEntity.status(200).headers(headers).body(Map.of("message", "login successful")); 
    }
}