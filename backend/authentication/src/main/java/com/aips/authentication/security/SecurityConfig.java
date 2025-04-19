package com.aips.authentication.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(
            JwtTokenProvider tokenProvider,
            UserDetailsService userDetailsService,
            AuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthFilter) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("Configuring security filter chain...");
        
        http
            .csrf(csrf -> {
                System.out.println("Disabling CSRF protection");
                csrf.disable();
            })
            .cors(cors -> {
                System.out.println("Configuring CORS");
                cors.configurationSource(corsConfigurationSource());
            })
            .authorizeHttpRequests(auth -> {
                System.out.println("Configuring authorization rules");
                auth
                    .requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/users/superuser").permitAll()
                    .requestMatchers("/users/check-username-availability").permitAll()
                    .requestMatchers("/users/check-email-availability").permitAll()
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .requestMatchers("/api/v1/users/username/*/roles").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .requestMatchers("/api/v1/users").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .requestMatchers("/api/v1/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .requestMatchers("/api/v1/roles").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .requestMatchers("/api/v1/roles/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    .anyRequest().authenticated();
            })
            .sessionManagement(session -> {
                System.out.println("Configuring session management");
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
            })
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .securityContext(securityContext -> securityContext.requireExplicitSave(false))
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
            .requestCache(requestCache -> requestCache.disable());

        System.out.println("Security filter chain configuration completed");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        System.out.println("Configuring CORS settings");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        System.out.println("CORS configuration completed");
        return source;
    }
} 