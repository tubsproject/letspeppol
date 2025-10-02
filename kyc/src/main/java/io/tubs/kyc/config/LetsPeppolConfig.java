package io.tubs.kyc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class LetsPeppolConfig {

    @Bean
    public WebClient webClient(@Value("${proxy.api.url:https://api.letspeppol.org}") String apiUrl) {
        return WebClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

//    @Bean
//    public RestClient restClient(@Value("${PEPPOL_PROXY_API_URL:https://api.letspeppol.org}") String apiUrl) {
//        return RestClient.builder()
//                .requestFactory(new HttpComponentsClientHttpRequestFactory())
//                .baseUrl(apiUrl)
//                .build();
//    }

}
