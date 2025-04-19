package com.aips.authentication.service;

import com.aips.authentication.dto.RoleDTO;
import com.aips.authentication.model.Role;
import com.aips.authentication.repository.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {
    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles() {
        logger.info("[RoleService] Getting all roles");
        List<Role> roles = roleRepository.findAll();
        logger.info("[RoleService] Found {} roles", roles.size());
        return roles.stream()
                .map(role -> {
                    logger.info("[RoleService] Converting role {} to DTO", role.getName());
                    return RoleDTO.fromRole(role);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        logger.info("[RoleService] Getting role by id: {}", id);
        return roleRepository.findById(id)
                .map(role -> {
                    logger.info("[RoleService] Found role: {}", role.getName());
                    return RoleDTO.fromRole(role);
                })
                .orElseThrow(() -> {
                    logger.error("[RoleService] Role not found with id: {}", id);
                    return new RuntimeException("Role not found");
                });
    }
} 