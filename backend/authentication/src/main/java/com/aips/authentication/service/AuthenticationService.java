package com.aips.authentication.service;

import com.aips.authentication.model.User;
import com.aips.authentication.repository.UserRepository;
import com.aips.authentication.security.JwtTokenProvider;
import com.aips.authentication.dto.LoginRequest;
import com.aips.authentication.dto.SignupRequest;
import com.aips.authentication.exception.UserAlreadyExistsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Authenticate user and generate JWT token.
     *
     * @param loginRequest Login credentials
     * @return JWT token
     */
    public String authenticateUser(LoginRequest loginRequest) {
        // Authenticate user credentials
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        // Generate JWT token
        return tokenProvider.generateToken(authentication);
    }

    /**
     * Register a new user.
     *
     * @param signupRequest User registration data
     * @return Created user
     * @throws UserAlreadyExistsException if username or email already exists
     */
    @Transactional
    public User registerUser(SignupRequest signupRequest) {
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

        // Set default role
        user.getRoles().add("ROLE_USER");

        // Save user
        return userRepository.save(user);
    }
} 