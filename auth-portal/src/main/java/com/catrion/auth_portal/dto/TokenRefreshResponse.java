package com.catrion.auth_portal.dto;


public record TokenRefreshResponse(
        String accessToken,
        String refreshToken,
        String tokenType
) {
}
