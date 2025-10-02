package io.tubs.kyc.config;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "encryption")
public class EncryptionProperties {
    private String activeKeyId = "default";
    private Map<String,String> keys = new HashMap<>();

    @PostConstruct
    void validate() {
        if (keys.isEmpty()) {
            throw new IllegalStateException("No encryption.keys.* configured");
        }
        if (!keys.containsKey(activeKeyId)) {
            if (keys.size() == 1) {
                // Promote the single configured key as active
                activeKeyId = keys.keySet().iterator().next();
            } else {
                throw new IllegalStateException("Active key id '" + activeKeyId + "' not present among configured keys");
            }
        }
    }

    public String getActiveKeyId() { return activeKeyId; }
    public void setActiveKeyId(String activeKeyId) { this.activeKeyId = activeKeyId; }
    public Map<String, String> getKeys() { return keys; }
    public void setKeys(Map<String, String> keys) { this.keys = keys; }
}
