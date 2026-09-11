package com.catrion.auth_portal.controller;

import com.catrion.auth_portal.entity.User;
import com.catrion.auth_portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public Map<String, Object> profile(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "enabled", user.isEnabled(),
                "roles", user.getRoles()
                        .stream()
                        .map(role -> role.getName())
                        .toList()
        );
    }

    @GetMapping("/secure-profile")
    @PreAuthorize("hasAuthority('PROFILE_READ')")
    public Map<String, String> secureProfile(Authentication authentication) {
        return Map.of(
                "message", "Authorized profile access",
                "user", authentication.getName()
        );
    }
}
