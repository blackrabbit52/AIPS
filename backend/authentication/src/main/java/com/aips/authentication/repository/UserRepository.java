package com.aips.authentication.repository;

import com.aips.authentication.model.User;
import com.aips.authentication.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
     * Find a user by their username or email address.
     *
     * @param username Username to search for
     * @param email Email to search for
     * @return Optional containing the user if found
     */
    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);
    
    /**
     * Check if a user exists with the given username.
     *
     * @param username Username to check
     * @return true if user exists, false otherwise
     */
    Boolean existsByUsername(String username);
    
    /**
     * Check if a user exists with the given email.
     *
     * @param email Email to check
     * @return true if user exists, false otherwise
     */
    Boolean existsByEmail(String email);
    
    /**
     * Check if a user exists with the given role name.
     *
     * @param name Role name to check
     * @return true if user exists, false otherwise
     */
    Boolean existsByRoles_Name(Role.RoleType name);
} 