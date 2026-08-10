package org.example.helpdesk_backend.dto.response;

import org.example.helpdesk_backend.model.TicketPriority;
import org.example.helpdesk_backend.model.TicketStatus;

import java.time.LocalDateTime;

public record TicketResponse(
        Long id,
        String title,
        String description,
        TicketStatus status,
        TicketPriority priority,
        String authorName,
        String assigneeName,
        LocalDateTime createdAt
) {
}