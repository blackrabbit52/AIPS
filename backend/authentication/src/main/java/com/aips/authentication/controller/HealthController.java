package com.aips.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/actuator/health")
    public ResponseEntity<?> healthCheck() {
        logger.info("Début de la vérification de santé");
        try {
            // Vérifier la connexion à la base de données
            logger.debug("Tentative de connexion à la base de données...");
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            logger.info("Vérification de santé réussie");
            return ResponseEntity.ok().body("{\"status\": \"UP\"}");
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification de santé: {}", e.getMessage());
            return ResponseEntity.status(503).body("{\"status\": \"DOWN\", \"error\": \"" + e.getMessage() + "\"}");
        }
    }
} 