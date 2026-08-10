package org.example.helpdesk_backend.service;

import org.example.helpdesk_backend.dto.request.AuthRequest;
import org.example.helpdesk_backend.dto.request.RegisterRequest;
import org.example.helpdesk_backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);

    AuthResponse register(RegisterRequest request);
}