package com.catrion.auth_portal.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        String email,
        String fullName,
        java.util.List<String> roles
) {
}
