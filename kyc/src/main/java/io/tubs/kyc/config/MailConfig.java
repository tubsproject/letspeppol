package io.tubs.kyc.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        // Host/port will be overridden by properties if present; defaults are fine for tests.
        return new JavaMailSenderImpl();
    }
}

