package com.aips.authentication.service;

import com.aips.authentication.model.User;
import com.aips.authentication.model.Role;
import com.aips.authentication.repository.UserRepository;
import com.aips.authentication.repository.RoleRepository;
import com.aips.authentication.security.JwtTokenProvider;
import com.aips.authentication.dto.LoginRequest;
import com.aips.authentication.dto.SignUpRequest;
import com.aips.authentication.exception.UserAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthenticationService(AuthenticationManager authenticationManager,
                               UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               JwtTokenProvider tokenProvider) {
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
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsernameOrEmail(),
                request.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        return new JwtAuthenticationResponse(
            jwt,
            userPrincipal.getId(),
            userPrincipal.getUsername(),
            userPrincipal.getEmail(),
            userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet())
        );
    }

    /**
     * Register a new user.
     *
     * @param signupRequest User registration data
     * @return ResponseEntity containing created user
     * @throws UserAlreadyExistsException if username or email already exists
     */
    @Transactional
    public ResponseEntity<?> registerUser(SignUpRequest signupRequest) {
        // Check if username is available
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken");
        }

        // Check if email is available
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        // Create new user
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFirstName(signupRequest.getFirstName());
        user.setLastName(signupRequest.getLastName());
        user.setEnabled(true);

        // Set default role
        Role userRole = roleRepository.findByName(Role.RoleType.ROLE_USER)
            .orElseGet(() -> roleRepository.save(Role.createDefaultUserRole()));
        
        user.setRoles(Set.of(userRole));

        // Save user
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
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