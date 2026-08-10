package org.example.helpdesk_backend.repository;

import org.example.helpdesk_backend.model.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
}