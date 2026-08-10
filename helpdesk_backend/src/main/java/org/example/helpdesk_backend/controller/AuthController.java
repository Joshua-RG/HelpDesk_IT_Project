package org.example.helpdesk_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.helpdesk_backend.dto.request.AuthRequest;
import org.example.helpdesk_backend.dto.response.AuthResponse;
import org.example.helpdesk_backend.model.Role;
import org.example.helpdesk_backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para Login y Registro de usuarios")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Inicia sesión y devuelve un token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Registra un nuevo usuario en el sistema")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody AuthRequest request,
            @RequestParam String fullName,
            @RequestParam Role role
    ) {
        AuthResponse response = authService.register(request, role, fullName);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}