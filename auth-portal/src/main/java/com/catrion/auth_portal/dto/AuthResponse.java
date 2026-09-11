package com.catrion.auth_portal.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        String email,
        String fullName
) {
}
