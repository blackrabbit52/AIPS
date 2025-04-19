package com.aips.authentication.controller;

import com.aips.authentication.dto.RoleDTO;
import com.aips.authentication.service.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = "http://localhost:3000")
public class RoleController {

    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);
    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<RoleDTO>> getAllRoles(HttpServletRequest request) {
        logger.info("Received request to get all roles");
        logger.info("Request URI: {}", request.getRequestURI());
        logger.info("Context Path: {}", request.getContextPath());
        logger.info("Servlet Path: {}", request.getServletPath());
        logger.info("Path Info: {}", request.getPathInfo());
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Current authentication: {}", auth);
        logger.debug("Current user: {}", auth != null ? auth.getName() : "anonymous");
        logger.debug("Current authorities: {}", auth != null ? auth.getAuthorities() : "none");

        try {
            logger.info("Attempting to fetch all roles");
            List<RoleDTO> roles = roleService.getAllRoles();
            logger.info("Successfully fetched {} roles", roles.size());
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            logger.error("Error fetching roles: ", e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        logger.info("Received request to get role by id: {}", id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Current authentication: {}", auth);
        logger.debug("Current user: {}", auth != null ? auth.getName() : "anonymous");
        logger.debug("Current authorities: {}", auth != null ? auth.getAuthorities() : "none");

        try {
            logger.info("Attempting to fetch role with id: {}", id);
            RoleDTO role = roleService.getRoleById(id);
            logger.info("Successfully fetched role: {}", role);
            return ResponseEntity.ok(role);
        } catch (Exception e) {
            logger.error("Error fetching role with id {}: ", id, e);
            throw e;
        }
    }
} 