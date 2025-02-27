package com.aips.authentication.service;

import com.aips.authentication.dto.LoginRequest;
import com.aips.authentication.dto.SignupRequest;
import com.aips.authentication.model.User;
import com.aips.authentication.repository.UserRepository;
import com.aips.authentication.security.JwtTokenProvider;
import com.aips.authentication.exception.UserAlreadyExistsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthenticationService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthenticationService(
            authenticationManager,
            userRepository,
            passwordEncoder,
            tokenProvider
        );
    }

    @Test
    void authenticateUser_ValidCredentials_ReturnsToken() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("test.jwt.token");

        // Act
        String token = authService.authenticateUser(loginRequest);

        // Assert
        assertNotNull(token);
        assertEquals("test.jwt.token", token);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider).generateToken(authentication);
    }

    @Test
    void registerUser_NewUser_CreatesUser() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFirstName("John");
        signupRequest.setLastName("Doe");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        User createdUser = authService.registerUser(signupRequest);

        // Assert
        assertNotNull(createdUser);
        assertEquals("newuser", createdUser.getUsername());
        assertEquals("newuser@example.com", createdUser.getEmail());
        assertEquals("encoded_password", createdUser.getPassword());
        assertEquals("John", createdUser.getFirstName());
        assertEquals("Doe", createdUser.getLastName());
        assertTrue(createdUser.getRoles().contains("ROLE_USER"));
    }

    @Test
    void registerUser_ExistingUsername_ThrowsException() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("existinguser");
        signupRequest.setEmail("newuser@example.com");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // Act & Assert
        assertThrows(UserAlreadyExistsException.class,
            () -> authService.registerUser(signupRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_ExistingEmail_ThrowsException() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("existing@example.com");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThrows(UserAlreadyExistsException.class,
            () -> authService.registerUser(signupRequest));
        verify(userRepository, never()).save(any(User.class));
    }
} 