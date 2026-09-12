package com.catrion.auth_portal.controller;

import com.catrion.auth_portal.entity.User;
import com.catrion.auth_portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('USER_READ')")
    public List<Map<String, Object>> getUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "enabled", user.isEnabled(),
                        "roles", user.getRoles()
                                .stream()
                                .map(role -> role.getName())
                                .toList()
                ))
                .toList();
    }

    @PatchMapping("/users/{id}/status")
    @PreAuthorize("hasAuthority('USER_DISABLE')")
    public Map<String, Object> updateStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        user.setEnabled(enabled);
        userRepository.save(user);

        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "enabled", user.isEnabled()
        );
    }
}
