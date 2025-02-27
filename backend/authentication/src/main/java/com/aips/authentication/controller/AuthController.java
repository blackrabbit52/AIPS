package com.aips.authentication.controller;

import com.aips.authentication.dto.JwtResponse;
import com.aips.authentication.dto.LoginRequest;
import com.aips.authentication.dto.SignupRequest;
import com.aips.authentication.model.User;
import com.aips.authentication.service.AuthenticationService;
import com.aips.authentication.service.UserService;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationService authService;
    private final UserService userService;

    public AuthController(AuthenticationService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /**
     * Handle user login requests.
     * 
     * @param loginRequest Login credentials
     * @return JWT response containing token and user information
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String jwt = authService.authenticateUser(loginRequest);
        User user = userService.findByUsername(loginRequest.getUsername());
        
        return ResponseEntity.ok(new JwtResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail()
        ));
    }

    /**
     * Handle user registration requests.
     * 
     * @param signupRequest Registration data
     * @return JWT response containing token and user information
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequest signupRequest) {
        User user = userService.createUser(signupRequest);
        String jwt = authService.authenticateUser(new LoginRequest(
            signupRequest.getUsername(),
            signupRequest.getPassword()
        ));
        
        return ResponseEntity.ok(new JwtResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail()
        ));
    }
} 