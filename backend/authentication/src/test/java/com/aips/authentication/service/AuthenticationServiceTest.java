package com.aips.authentication.service;

import com.aips.authentication.dto.SignInRequest;
import com.aips.authentication.dto.SignUpRequest;
import com.aips.authentication.model.Role;
import com.aips.authentication.model.User;
import com.aips.authentication.repository.RoleRepository;
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
import org.springframework.http.ResponseEntity;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import com.aips.authentication.dto.JwtAuthenticationResponse;

import java.util.Optional;

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
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void authenticateUser_ValidCredentials_ReturnsToken() {
        // Arrange
        SignInRequest signInRequest = new SignInRequest("testuser", "password123");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("test.jwt.token");

        // Act
        JwtAuthenticationResponse response = authenticationService.authenticateUser(signInRequest);

        // Assert
        assertNotNull(response);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider).generateToken(authentication);
    }

    @Test
    void registerUser_NewUser_CreatesUser() {
        // Arrange
        SignUpRequest signUpRequest = new SignUpRequest();
        signUpRequest.setUsername("newuser");
        signUpRequest.setEmail("newuser@example.com");
        signUpRequest.setPassword("password123");
        signUpRequest.setFirstName("John");
        signUpRequest.setLastName("Doe");

        Role role = new Role();
        role.setName(Role.RoleType.ROLE_USER);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(roleRepository.findByName(Role.RoleType.ROLE_USER)).thenReturn(Optional.of(role));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        ResponseEntity<?> response = authenticationService.registerUser(signUpRequest);

        // Assert
        assertNotNull(response);
        assertTrue(response.getStatusCode().is2xxSuccessful());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_ExistingUsername_ThrowsException() {
        // Arrange
        SignUpRequest signUpRequest = new SignUpRequest();
        signUpRequest.setUsername("existinguser");
        signUpRequest.setEmail("newuser@example.com");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // Act & Assert
        assertThrows(UserAlreadyExistsException.class,
            () -> authenticationService.registerUser(signUpRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_ExistingEmail_ThrowsException() {
        // Arrange
        SignUpRequest signUpRequest = new SignUpRequest();
        signUpRequest.setUsername("newuser");
        signUpRequest.setEmail("existing@example.com");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThrows(UserAlreadyExistsException.class,
            () -> authenticationService.registerUser(signUpRequest));
        verify(userRepository, never()).save(any(User.class));
    }
} 