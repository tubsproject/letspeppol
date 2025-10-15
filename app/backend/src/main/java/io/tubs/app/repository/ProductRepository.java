package io.tubs.app.repository;

import io.tubs.app.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT product FROM Product product WHERE product.company.companyNumber = :companyNumber ORDER BY product.name DESC")
    List<Product> findByOwningCompany(String companyNumber);
}