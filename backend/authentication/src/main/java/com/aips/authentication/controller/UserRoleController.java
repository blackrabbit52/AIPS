package com.aips.authentication.controller;

import com.aips.authentication.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserRoleController {

    private static final Logger logger = LoggerFactory.getLogger(UserRoleController.class);
    private final UserService userService;

    public UserRoleController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<String>> getUserRoles(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserRoles(userId));
    }

    @GetMapping("/username/{username}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<String>> getUserRolesByUsername(@PathVariable String username) {
        logger.info("Received request to get roles for username: {}", username);
        try {
            List<String> roles = userService.getUserRolesByUsername(username);
            logger.info("Successfully retrieved roles for username {}: {}", username, roles);
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            logger.error("Error retrieving roles for username {}: {}", username, e.getMessage());
            throw e;
        }
    }

    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        userService.assignRoleToUser(userId, roleId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> removeRoleFromUser(@PathVariable Long userId, @PathVariable Long roleId) {
        userService.removeRoleFromUser(userId, roleId);
        return ResponseEntity.ok().build();
    }
} 