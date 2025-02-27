package com.aips.authentication.repository;

import com.aips.authentication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by their username.
     *
     * @param username Username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find a user by their email address.
     *
     * @param email Email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if a user exists with the given username.
     *
     * @param username Username to check
     * @return true if user exists, false otherwise
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if a user exists with the given email.
     *
     * @param email Email to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);
} 