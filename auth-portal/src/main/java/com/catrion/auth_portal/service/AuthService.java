package com.catrion.auth_portal.service;

import com.catrion.auth_portal.dto.*;
import com.catrion.auth_portal.entity.RefreshToken;
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
    private final RefreshTokenService refreshTokenService;

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

        String refreshToken =
                refreshTokenService.createRefreshToken(user).getToken();

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                user.getEmail(),
                user.getFullName(),
                user.getRoles()
                        .stream()
                        .map(Role::getName)
                        .toList()
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
        String refreshToken =
                refreshTokenService.createRefreshToken(user).getToken();

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                user.getEmail(),
                user.getFullName(),
                user.getRoles()
                        .stream()
                        .map(Role::getName)
                        .toList()
        );
    }

    public TokenRefreshResponse refreshToken(
            RefreshTokenRequest request
    ) {

        RefreshToken refreshToken =
                refreshTokenService.findByToken(request.refreshToken());

        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(user.getEmail());

        String newAccessToken =
                jwtService.generateToken(userDetails);

        return new TokenRefreshResponse(
                newAccessToken,
                refreshToken.getToken(),
                "Bearer"
        );
    }

    @Transactional
    public void logout(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        refreshTokenService.deleteByUser(user);
    }
}
