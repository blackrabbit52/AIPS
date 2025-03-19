package com.aips.authentication.dto;

import jakarta.validation.constraints.NotBlank;

public class SignInRequest {
    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;

    // Constructeur par défaut
    public SignInRequest() {}

    // Constructeur avec paramètres
    public SignInRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    // Getters et Setters
    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
} 