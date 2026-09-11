package com.catrion.auth_portal.service;

import com.catrion.auth_portal.dto.AuthResponse;
import com.catrion.auth_portal.dto.LoginRequest;
import com.catrion.auth_portal.dto.RegisterRequest;
import com.catrion.auth_portal.entity.Role;
import com.catrion.auth_portal.entity.User;
import com.catrion.auth_portal.repository.RoleRepository;
import com.catrion.auth_portal.repository.UserRepository;
import com.catrion.auth_portal.security.CustomUserDetailsService;
import com.catrion.auth_portal.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() ->
                        new IllegalStateException("ROLE_USER not found"));

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .enabled(true)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken =
                jwtService.generateToken(userDetails);

        return new AuthResponse(
                accessToken,
                "Bearer",
                user.getEmail(),
                user.getFullName()
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow();

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken =
                jwtService.generateToken(userDetails);

        return new AuthResponse(
                accessToken,
                "Bearer",
                user.getEmail(),
                user.getFullName()
        );
    }
}
