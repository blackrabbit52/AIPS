package com.aips.authentication.config;

import com.aips.authentication.model.Role;
import com.aips.authentication.model.Role.RoleType;
import com.aips.authentication.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Initialize default roles in the database at application startup
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        // Initialize roles if they don't exist
        for (RoleType roleType : RoleType.values()) {
            if (!roleRepository.existsByName(roleType)) {
                Role role = new Role();
                role.setName(roleType);
                role.setDescription(roleType.name() + " role");
                roleRepository.save(role);
            }
        }
    }
} 