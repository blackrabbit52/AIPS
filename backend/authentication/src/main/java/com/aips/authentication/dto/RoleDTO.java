package com.aips.authentication.dto;

import com.aips.authentication.model.Role;

public record RoleDTO(
    Long id,
    String name,
    String description
) {
    public static RoleDTO fromRole(Role role) {
        return new RoleDTO(
            role.getId(),
            role.getName().name(),
            role.getDescription()
        );
    }
} 