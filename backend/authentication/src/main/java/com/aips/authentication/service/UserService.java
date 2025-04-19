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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

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

    @Transactional(readOnly = true)
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        return userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found: " + authentication.getName()));
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User updateProfile(User user, String firstName, String lastName) {
        user.setFirstName(firstName);
        user.setLastName(lastName);
        return userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        System.out.println("[UserService] Getting all users");
        List<User> users = userRepository.findAll();
        System.out.println("[UserService] Found " + users.size() + " users");
        return users.stream()
                .map(user -> {
                    System.out.println("[UserService] Converting user " + user.getUsername() + " to response");
                    return convertToUserResponse(user);
                })
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponse)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public UserResponse createUser(UserResponse userRequest) {
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        return convertToUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, UserResponse userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getUsername().equals(userRequest.getUsername()) && 
            userRepository.existsByUsername(userRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!user.getEmail().equals(userRequest.getEmail()) && 
            userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        user.setUsername(userRequest.getUsername());
        user.setEmail(userRequest.getEmail());
        return convertToUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public List<String> getUserRoles(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
    }

    public Set<String> getUserRoleNames(Long userId) {
        return getUserRoles(userId).stream()
                .collect(Collectors.toSet());
    }

    public List<UserResponse> getAllUsersResponse() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getUserByIdResponse(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional
    public UserResponse updateUserResponse(Long id, UserResponse userRequest) {
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

    private UserResponse convertToUserResponse(User user) {
        if (user == null) {
            System.out.println("[UserService] User is null, returning null response");
            return null;
        }
        System.out.println("[UserService] Converting user " + user.getUsername() + " to response");
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoles() != null ? user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()) : Collections.emptySet()
        );
    }

    public boolean existsSuperAdmin() {
        return userRepository.existsByRoles_Name(RoleType.ROLE_SUPER_ADMIN);
    }

    private Role findRole(String roleName) {
        RoleType roleType = RoleType.valueOf(roleName);
        return roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found"));
    }

    public boolean existsByRoleName(RoleType roleType) {
        return roleRepository.existsByName(roleType);
    }

    public boolean hasRole(User user, RoleType roleType) {
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

    public List<String> getUserRoles(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignRoleToUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Transactional
    public void removeRoleFromUser(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        
        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public List<String> getUserRolesByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toList());
    }
} 