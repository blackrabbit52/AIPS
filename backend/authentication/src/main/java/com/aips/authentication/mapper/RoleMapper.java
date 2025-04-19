package com.aips.authentication.mapper;

import com.aips.authentication.dto.RoleRequest;
import com.aips.authentication.dto.RoleResponse;
import com.aips.authentication.model.Role;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role) {
        if (role == null) {
            return null;
        }
        return new RoleResponse(
            role.getId(),
            role.getName().name(),
            role.getDescription(),
            role.getPermissions()
        );
    }

    public List<RoleResponse> toResponseList(List<Role> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public Role toEntity(RoleRequest request) {
        if (request == null) {
            return null;
        }
        Role role = new Role();
        role.setName(Role.RoleType.valueOf(request.getName()));
        role.setDescription(request.getDescription());
        role.setPermissions(new HashSet<>(request.getPermissions()));
        return role;
    }

    public void updateEntity(Role role, RoleRequest request) {
        if (request == null || role == null) {
            return;
        }
        if (request.getName() != null) {
            role.setName(Role.RoleType.valueOf(request.getName()));
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getPermissions() != null) {
            role.setPermissions(new HashSet<>(request.getPermissions()));
        }
    }
} 