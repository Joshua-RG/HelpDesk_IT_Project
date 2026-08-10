package org.example.helpdesk_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.helpdesk_backend.dto.request.TicketRequest;
import org.example.helpdesk_backend.dto.response.TicketResponse;
import org.example.helpdesk_backend.model.TicketStatus;
import org.example.helpdesk_backend.service.TicketService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Endpoints para la gestión de tickets de soporte")
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    @Operation(summary = "Crea un nuevo ticket de soporte")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            Principal principal
    ) {
        String userEmail = principal.getName();
        TicketResponse response = ticketService.createTicket(request, userEmail);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lista los tickets de forma paginada (Filtra por rol)")
    public ResponseEntity<Page<TicketResponse>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        String userEmail = principal.getName();
        Page<TicketResponse> response = ticketService.getAllTickets(page, size, userEmail);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Actualiza el estado de un ticket (Solo IT_SUPPORT)")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            Principal principal
    ) {
        String userEmail = principal.getName();
        TicketResponse response = ticketService.updateTicketStatus(id, status, userEmail);
        return ResponseEntity.ok(response);
    }
}