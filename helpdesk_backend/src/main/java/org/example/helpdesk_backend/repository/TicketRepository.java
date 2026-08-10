package org.example.helpdesk_backend.repository;

import org.example.helpdesk_backend.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByAuthorId(Long authorId, Pageable pageable);
}