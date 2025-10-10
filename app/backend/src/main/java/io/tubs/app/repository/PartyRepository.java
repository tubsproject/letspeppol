package io.tubs.app.repository;

import io.tubs.app.model.Party;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartyRepository extends JpaRepository<Party, Long> {
    List<Party> findByCompanyNumber(String companyNumber);
}
