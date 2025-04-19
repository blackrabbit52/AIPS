package com.aips.authentication.controller;

import com.aips.authentication.dto.SignUpRequest;
import com.aips.authentication.dto.UserDTO;
import com.aips.authentication.dto.UserResponse;
import com.aips.authentication.service.UserService;
import com.aips.authentication.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(HttpServletRequest request) {
        logger.info("Received request to get all users");
        logger.info("Request URI: {}", request.getRequestURI());
        logger.info("Context Path: {}", request.getContextPath());
        logger.info("Servlet Path: {}", request.getServletPath());
        logger.info("Path Info: {}", request.getPathInfo());
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Current authentication: {}", auth);
        logger.debug("Current user: {}", auth != null ? auth.getName() : "anonymous");
        logger.debug("Current authorities: {}", auth != null ? auth.getAuthorities() : "none");

        try {
            logger.info("Attempting to fetch all users");
            List<UserResponse> users = userService.getAllUsers();
            logger.info("Successfully fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching users: ", e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        logger.info("Received request to get user by id: {}", id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Current authentication: {}", auth);
        logger.debug("Current user: {}", auth != null ? auth.getName() : "anonymous");
        logger.debug("Current authorities: {}", auth != null ? auth.getAuthorities() : "none");

        try {
            logger.info("Attempting to fetch user with id: {}", id);
            UserResponse user = userService.getUserById(id);
            logger.info("Successfully fetched user: {}", user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error fetching user with id {}: ", id, e);
            throw e;
        }
    }

    @PostMapping("/superuser")
    public ResponseEntity<?> createSuperUser(@RequestBody SignUpRequest request) {
        System.out.println("Attempting to create superuser: " + request.getUsername());
        return userService.registerSuperAdmin(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,
                                            @Valid @RequestBody UserResponse userRequest) {
        return ResponseEntity.ok(userService.updateUser(id, userRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-username-availability")
    public ResponseEntity<Boolean> checkUsernameAvailability(@RequestParam String username) {
        return ResponseEntity.ok(!userRepository.existsByUsername(username));
    }

    @GetMapping("/check-email-availability")
    public ResponseEntity<Boolean> checkEmailAvailability(@RequestParam String email) {
        return ResponseEntity.ok(!userRepository.existsByEmail(email));
    }
} 