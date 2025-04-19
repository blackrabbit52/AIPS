package com.aips.authentication.service;

import com.aips.authentication.dto.AuthenticationRequest;
import com.aips.authentication.dto.AuthenticationResponse;
import com.aips.authentication.dto.SignUpRequest;
import com.aips.authentication.model.Role;
import com.aips.authentication.model.Role.RoleType;
import com.aips.authentication.model.User;
import com.aips.authentication.repository.RoleRepository;
import com.aips.authentication.repository.UserRepository;
import com.aips.authentication.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import com.aips.authentication.dto.SignInRequest;
import com.aips.authentication.dto.JwtAuthenticationResponse;
import com.aips.authentication.security.UserPrincipal;
import com.aips.authentication.dto.UserResponse;
import java.util.Collections;
import org.springframework.security.core.AuthenticationException;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService tokenProvider;

    public AuthenticationService(AuthenticationManager authenticationManager,
                               UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               JwtService tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Authenticate user and generate JWT token.
     *
     * @param loginRequest Login credentials
     * @return ResponseEntity containing JWT token
     */
    public JwtAuthenticationResponse authenticateUser(SignInRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsernameOrEmail(),
                    request.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Récupérer le UserPrincipal depuis l'authentification
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            // Générer le token avec le UserPrincipal (qui implémente UserDetails)
            String jwt = tokenProvider.generateToken(userPrincipal);

            return new JwtAuthenticationResponse(
                jwt,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet())
            );
        } catch (AuthenticationException e) {
            logger.error("Erreur d'authentification: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Register a new user.
     *
     * @param signupRequest User registration data
     * @return ResponseEntity containing created user
     * @throws UserAlreadyExistsException if username or email already exists
     */
    @Transactional
    public ResponseEntity<?> registerUser(SignUpRequest request) {
        // Vérifier si l'username existe déjà
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken");
        }

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use");
        }

        // Créer un nouvel utilisateur
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Assign default role
        Role defaultRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleType.ROLE_USER);
                    role.setDescription("Default user role");
                    return roleRepository.save(role);
                });
        
        Set<Role> roles = new HashSet<>();
        roles.add(defaultRole);
        user.setRoles(roles);

        // Sauvegarder l'utilisateur
        User result = userRepository.save(user);
        
        return ResponseEntity.ok(convertToUserResponse(result));
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

    @Transactional
    public void assignRoleToUser(String username, RoleType roleType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Role role = roleRepository.findByName(roleType)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleType);
                    newRole.setDescription(roleType.name() + " role");
                    return roleRepository.save(newRole);
                });

        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Transactional
    public void removeRoleFromUser(String username, RoleType roleType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public Set<String> getUserRoles(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());
    }
}

class ErrorResponse {
    private String error;

    public ErrorResponse(String error) {
        this.error = error;
    }

    public String getError() {
        return error;
    }
} 