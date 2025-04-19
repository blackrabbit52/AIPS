package com.aips.authentication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "roles")
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
    @Column(length = 20)
    private RoleType name;
    
    private String description;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id"))
    @Column(name = "permission")
    private Set<String> permissions = new HashSet<>();
    
    @JsonIgnore
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
    
    public Role() {
    }

    /**
     * Creates a default user role
     * @return Role object with ROLE_USER type
     */
    public static Role createDefaultUserRole() {
        Role role = new Role();
        role.setName(RoleType.ROLE_USER);
        role.setDescription("Default user role");
        role.setPermissions(new HashSet<>(Set.of("READ")));
        return role;
    }

    /**
     * Creates an admin role with full permissions
     * @return Role object with ROLE_ADMIN type
     */
    public static Role createAdminRole() {
        Role role = new Role();
        role.setName(RoleType.ROLE_ADMIN);
        role.setDescription("Administrator role");
        role.setPermissions(new HashSet<>(Set.of("READ", "WRITE", "DELETE", "ADMIN")));
        return role;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<String> permissions) {
        this.permissions = permissions;
    }

    @JsonIgnore
    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(id, role.id) &&
               name == role.name;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }

    @Override
    public String toString() {
        return "Role{" +
               "id=" + id +
               ", name=" + name +
               ", description='" + description + '\'' +
               ", permissions=" + permissions +
               '}';
    }
} 