package com.aips.authentication.model;

import jakarta.persistence.*;
import java.util.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
public class Role {
    public enum RoleType {
        ROLE_USER,
        ROLE_ADMIN,
        ROLE_SUPER_ADMIN,
        ROLE_ANALYST
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 60)
    private RoleType name;
    
    private String description;
    
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
    
    /**
     * Creates a default user role
     * @return Role object with ROLE_USER type
     */
    public static Role createDefaultUserRole() {
        Role role = new Role();
        role.setName(RoleType.ROLE_USER);
        role.setDescription("Default user role with basic permissions");
        return role;
    }

    public static Role createAdminRole() {
        Role role = new Role();
        role.setName(RoleType.ROLE_ADMIN);
        role.setDescription("Administrator role with full access");
        return role;
    }

    public Set<User> getUsers() {
        return users;
    }

    public Role() {
    }

    public Role(RoleType name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoleType getName() {
        return name;
    }

    public void setName(RoleType name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 