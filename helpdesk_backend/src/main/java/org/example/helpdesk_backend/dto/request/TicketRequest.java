package org.example.helpdesk_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.helpdesk_backend.model.TicketPriority;

public record TicketRequest(
        @NotBlank(message = "El título no puede estar vacío")
        String title,

        @NotBlank(message = "La descripción no puede estar vacía")
        String description,

        @NotNull(message = "La prioridad es obligatoria")
        TicketPriority priority
) {
}