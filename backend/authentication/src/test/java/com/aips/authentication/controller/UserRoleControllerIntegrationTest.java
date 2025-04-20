package com.aips.authentication.controller;

import com.aips.authentication.model.Role;
import com.aips.authentication.model.Role.RoleType;
import com.aips.authentication.model.User;
import com.aips.authentication.repository.RoleRepository;
import com.aips.authentication.repository.UserRepository;
import com.aips.authentication.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserRoleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        // Create test roles
        Role adminRole = new Role();
        adminRole.setName(RoleType.ROLE_ADMIN);
        roleRepository.save(adminRole);

        Role userRole = new Role();
        userRole.setName(RoleType.ROLE_USER);
        roleRepository.save(userRole);

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        Set<Role> roles = new HashSet<>();
        roles.add(adminRole);
        testUser.setRoles(roles);
        userRepository.save(testUser);

        // Create Authentication object
        Set<SimpleGrantedAuthority> authorities = testUser.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(testUser.getUsername())
                .password(testUser.getPassword())
                .authorities(authorities)
                .build();

        // Generate JWT token
        jwtToken = tokenProvider.generateToken(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                userDetails, null, authorities));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserRoles_WithValidUsername_ShouldReturnRoles() throws Exception {
        mockMvc.perform(get("/api/v1/users/username/{username}/roles", testUser.getUsername())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("ROLE_ADMIN"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getUserRoles_WithUnauthorizedUser_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users/username/{username}/roles", testUser.getUsername())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserRoles_WithNonExistentUsername_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/username/{username}/roles", "nonexistent")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
} 