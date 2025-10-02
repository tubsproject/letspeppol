package io.tubs.kyc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Apply CORS to all endpoints (including error paths) to ensure headers are always present
        registry.addMapping("/**")
                // Support common localhost variants used during development
                .allowedOrigins("http://localhost:9000", "http://127.0.0.1:9000", "http://localhost:3000", "http://127.0.0.1:3000", "https://localhost:3000", "https://127.0.0.1:3000", "https://letspeppol.httpsonlan.com:3001")
                //.allowedOrigins("*")
                // Explicitly allow standard CRUD + pre-flight
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Allow all headers to avoid blocking custom auth / content-type
                .allowedHeaders("*")
                // Expose any headers you may need on the client (add more as needed)
                .exposedHeaders("Location")
                // Allow credentials (cookies / auth headers). NOTE: origin list must stay explicit (no *) when credentials are allowed
                .allowCredentials(true)
                // Cache pre-flight response for 1 hour
                .maxAge(3600);
    }
}
