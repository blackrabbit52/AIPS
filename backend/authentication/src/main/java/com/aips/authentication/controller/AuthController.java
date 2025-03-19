package com.aips.authentication.controller;

import com.aips.authentication.dto.SignInRequest;
import com.aips.authentication.dto.SignUpRequest;
import com.aips.authentication.service.AuthenticationService;
import com.aips.authentication.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService authenticationService;
    private final UserService userService;

    public AuthController(AuthenticationService authenticationService, UserService userService) {
        this.authenticationService = authenticationService;
        this.userService = userService;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody SignInRequest loginRequest) {
        return ResponseEntity.ok(authenticationService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        return userService.registerUser(signUpRequest);
    }

    @PostMapping("/signup/super-admin")
    public ResponseEntity<?> registerSuperAdmin(@Valid @RequestBody SignUpRequest signUpRequest) {
        return userService.registerSuperAdmin(signUpRequest);
    }
} 