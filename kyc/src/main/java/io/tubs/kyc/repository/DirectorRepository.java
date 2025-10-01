package io.tubs.kyc.repository;

import io.tubs.kyc.model.kbo.Director;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectorRepository extends JpaRepository<Director, Long> {
}

