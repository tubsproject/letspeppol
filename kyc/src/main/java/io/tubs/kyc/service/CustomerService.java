package io.tubs.kyc.service;

import io.tubs.kyc.exception.NotFoundException;
import io.tubs.kyc.model.Customer;
import io.tubs.kyc.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public Customer findCustomerWithCredentials(String email, String password) {
        Customer customer = customerRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("Customer does not exist"));
        if (!passwordEncoder.matches(password, customer.getPasswordHash())) {
            throw new RuntimeException("Wrong password");
        }
        return customer;
    }

}
