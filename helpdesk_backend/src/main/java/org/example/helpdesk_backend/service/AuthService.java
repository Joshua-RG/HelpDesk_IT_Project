package org.example.helpdesk_backend.service;

import org.example.helpdesk_backend.dto.request.AuthRequest;
import org.example.helpdesk_backend.dto.response.AuthResponse;
import org.example.helpdesk_backend.model.Role;

public interface AuthService {
    AuthResponse login(AuthRequest request);

    AuthResponse register(AuthRequest request, Role role, String fullName);
}