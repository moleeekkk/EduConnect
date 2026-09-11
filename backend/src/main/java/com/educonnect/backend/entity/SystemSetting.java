package com.educonnect.backend.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @Column(name = "setting_key", length = 100, nullable = false)
    @JsonProperty("setting_key")
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    @JsonProperty("setting_value")
    private String settingValue;

    @Column(name = "description")
    @JsonProperty("description")
    private String description;

    @Column(name = "updated_at", nullable = false)
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { this.settingValue = settingValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public static SystemSettingBuilder builder() {
        return new SystemSettingBuilder();
    }

    public static class SystemSettingBuilder {
        private String settingKey;
        private String settingValue;
        private String description;

        public SystemSettingBuilder settingKey(String settingKey) { this.settingKey = settingKey; return this; }
        public SystemSettingBuilder settingValue(String settingValue) { this.settingValue = settingValue; return this; }
        public SystemSettingBuilder description(String description) { this.description = description; return this; }

        public SystemSetting build() {
            SystemSetting s = new SystemSetting();
            s.setSettingKey(settingKey);
            s.setSettingValue(settingValue);
            s.setDescription(description);
            return s;
        }
    }
}
