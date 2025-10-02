package io.tubs.kyc.service.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Component
public class ActivationEmailTemplateProvider {
    private static final Logger log = LoggerFactory.getLogger(ActivationEmailTemplateProvider.class);

    public record RenderedTemplate(String subject, String body) {}

    private final Resource templateResource;
    private final String defaultSubject;
    private String cachedTemplate;

    public ActivationEmailTemplateProvider(
            @Value("classpath:mail/activation-email.txt") Resource templateResource,
            @Value("${app.mail.subject.activation:Confirm your email address}") String defaultSubject) {
        this.templateResource = templateResource;
        this.defaultSubject = defaultSubject;
    }

    public RenderedTemplate render(String companyNumber, String activationLink) {
        String bodyTemplate = loadTemplate();
        String body = bodyTemplate
                .replace("{{companyNumber}}", escape(companyNumber))
                .replace("{{activationLink}}", activationLink);
        return new RenderedTemplate(defaultSubject, body);
    }

    private String loadTemplate() {
        if (cachedTemplate != null) return cachedTemplate;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(templateResource.getInputStream(), StandardCharsets.UTF_8))) {
            cachedTemplate = reader.lines().collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.warn("Could not load activation email template, using fallback: {}", e.getMessage());
            cachedTemplate = "Dear user,\n\nPlease verify your email for company {{companyNumber}} by clicking: {{activationLink}}\n\nRegards";
        }
        return cachedTemplate;
    }

    private String escape(String v) { return v == null ? "" : v; }
}

