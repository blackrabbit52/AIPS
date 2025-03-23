package com.aips.authentication.service;

import com.aips.authentication.dto.SignUpRequest;
import com.aips.authentication.dto.UserResponse;
import com.aips.authentication.exception.ResourceNotFoundException;
import com.aips.authentication.model.Role;
import com.aips.authentication.model.Role.RoleType;
import com.aips.authentication.model.User;
import com.aips.authentication.repository.RoleRepository;
import com.aips.authentication.repository.UserRepository;
import com.aips.authentication.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, 
                      RoleRepository roleRepository, 
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Load user by username for Spring Security authentication.
     *
     * @param usernameOrEmail Username or email to search for
     * @return UserDetails object for Spring Security
     * @throws UsernameNotFoundException if user not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        logger.info("Tentative de chargement de l'utilisateur: {}", usernameOrEmail);
        
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
            .orElseThrow(() -> {
                logger.error("Utilisateur non trouvé: {}", usernameOrEmail);
                return new UsernameNotFoundException("Utilisateur non trouvé avec le username ou email: " + usernameOrEmail);
            });
            
        logger.info("Utilisateur trouvé: {}", user.getUsername());
        return UserPrincipal.create(user);
    }

    /**
     * Get current authenticated user.
     *
     * @param authentication Current authentication object
     * @return User object for the authenticated user
     * @throws UsernameNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + authentication.getName()));
    }

    /**
     * Find user by username.
     *
     * @param username Username to search for
     * @return User object if found
     */
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * Find user by email.
     *
     * @param email Email to search for
     * @return User object if found
     */
    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    /**
     * Update user profile information.
     *
     * @param user User to update
     * @param firstName New first name
     * @param lastName New last name
     * @return Updated user
     */
    @Transactional
    public User updateProfile(User user, String firstName, String lastName) {
        user.setFirstName(firstName);
        user.setLastName(lastName);
        return userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public UserResponse updateUser(Long id, UserResponse userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setEmail(userRequest.getEmail());
        
        if (userRequest.getRoles() != null) {
            Set<Role> roles = userRequest.getRoles().stream()
                    .map(roleName -> findRole(roleName))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        return convertToUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserResponse convertToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet())
        );
    }

    public boolean existsSuperAdmin() {
        return userRepository.existsByRoles_Name(Role.RoleType.ROLE_SUPER_ADMIN);
    }

    private Role findRole(String roleName) {
        Role.RoleType roleType;
        try {
            roleType = Role.RoleType.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role name: " + roleName);
        }
        return roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    public boolean existsByRoleName(Role.RoleType roleType) {
        return roleRepository.existsByName(roleType);
    }

    public boolean hasRole(User user, Role.RoleType roleType) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleType));
    }

    @Transactional
    public ResponseEntity<?> registerUser(SignUpRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        Set<Role> roles = new HashSet<>();
        roles.add(Role.createDefaultUserRole());
        user.setRoles(roles);

        User result = userRepository.save(user);
        
        return ResponseEntity.ok(convertToUserResponse(result));
    }

    @Transactional
    public ResponseEntity<?> registerSuperAdmin(SignUpRequest request) {
        try {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body("Username is already taken");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email is already in use");
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());

            // Add all available roles to super admin temporarily
            Set<Role> roles = new HashSet<>();
            roles.add(roleRepository.findByName(RoleType.ROLE_SUPER_ADMIN)
                .orElseThrow(() -> new RuntimeException("Role SUPER_ADMIN not found")));
            roles.add(roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Role ADMIN not found")));
            roles.add(roleRepository.findByName(RoleType.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role USER not found")));
            roles.add(roleRepository.findByName(RoleType.ROLE_ANALYST)
                .orElseThrow(() -> new RuntimeException("Role ANALYST not found")));

            user.setRoles(roles);
            User savedUser = userRepository.save(user);
            
            return ResponseEntity.ok(convertToUserResponse(savedUser));
        } catch (Exception e) {
            logger.error("Error while registering super admin", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
} 