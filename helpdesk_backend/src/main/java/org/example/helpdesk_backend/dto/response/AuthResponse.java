package org.example.helpdesk_backend.dto.response;

public record AuthResponse(
        String token,
        String email,
        String role
) {
}