package org.example.helpdesk_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.helpdesk_backend.dto.request.TicketRequest;
import org.example.helpdesk_backend.dto.response.TicketResponse;
import org.example.helpdesk_backend.model.*;
import org.example.helpdesk_backend.repository.TicketHistoryRepository;
import org.example.helpdesk_backend.repository.TicketRepository;
import org.example.helpdesk_backend.repository.UserRepository;
import org.example.helpdesk_backend.service.TicketService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketHistoryRepository ticketHistoryRepository;

    @Override
    @Transactional
    public TicketResponse createTicket(TicketRequest request, String authorEmail) {
        User author = getUserByEmail(authorEmail);

        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .status(TicketStatus.OPEN)
                .author(author)
                .build();

        ticket = ticketRepository.save(ticket);

        saveHistory(ticket, author, "CREATED", "Ticket creado con prioridad " + request.priority());

        return mapToResponse(ticket);
    }

    @Override
    public Page<TicketResponse> getAllTickets(int page, int size, String userEmail) {
        User user = getUserByEmail(userEmail);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Ticket> ticketPage;

        if (user.getRole() == Role.IT_SUPPORT) {
            ticketPage = ticketRepository.findAll(pageable);
        } else {
            ticketPage = ticketRepository.findByAuthorId(user.getId(), pageable);
        }

        return ticketPage.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public TicketResponse updateTicketStatus(Long ticketId, TicketStatus newStatus, String userEmail) {
        User user = getUserByEmail(userEmail);

        if (user.getRole() != Role.IT_SUPPORT) {
            throw new IllegalArgumentException("No tienes permisos para cambiar el estado de los tickets.");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("El ticket no existe."));

        if (ticket.getStatus() == newStatus) {
            throw new IllegalArgumentException("El ticket ya se encuentra en estado: " + newStatus);
        }

        String oldStatus = ticket.getStatus().name();
        ticket.setStatus(newStatus);

        if (ticket.getAssignee() == null) {
            ticket.setAssignee(user);
        }

        ticket = ticketRepository.save(ticket);

        String historyDetail = String.format("Estado actualizado de %s a %s", oldStatus, newStatus.name());
        saveHistory(ticket, user, "STATUS_CHANGED", historyDetail);

        return mapToResponse(ticket);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado en el sistema."));
    }

    private void saveHistory(Ticket ticket, User user, String action, String content) {
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .user(user)
                .actionType(action)
                .content(content)
                .build();
        ticketHistoryRepository.save(history);
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getAuthor().getFullName(),
                ticket.getAssignee() != null ? ticket.getAssignee().getFullName() : "Sin asignar",
                ticket.getCreatedAt()
        );
    }
}