package org.example.helpdesk_backend.service;

import org.example.helpdesk_backend.dto.request.TicketRequest;
import org.example.helpdesk_backend.dto.response.TicketResponse;
import org.example.helpdesk_backend.model.TicketStatus;
import org.springframework.data.domain.Page;

public interface TicketService {
    TicketResponse createTicket(TicketRequest request, String authorEmail);

    Page<TicketResponse> getAllTickets(int page, int size, String userEmail);

    TicketResponse updateTicketStatus(Long ticketId, TicketStatus status, String userEmail);
}