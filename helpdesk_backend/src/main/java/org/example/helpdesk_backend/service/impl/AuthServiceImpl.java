package org.example.helpdesk_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.helpdesk_backend.dto.request.AuthRequest;
import org.example.helpdesk_backend.dto.response.AuthResponse;
import org.example.helpdesk_backend.model.Role;
import org.example.helpdesk_backend.model.User;
import org.example.helpdesk_backend.repository.UserRepository;
import org.example.helpdesk_backend.security.JwtUtil;
import org.example.helpdesk_backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        String token = generateUserToken(user);

        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    @Override
    public AuthResponse register(AuthRequest request, Role role, String fullName) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }

        User user = User.builder()
                .fullName(fullName)
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = generateUserToken(user);

        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }

    private String generateUserToken(User user) {
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        return jwtUtil.generateToken(userDetails);
    }
}