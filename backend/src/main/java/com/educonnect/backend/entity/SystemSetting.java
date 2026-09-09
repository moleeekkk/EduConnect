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

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }
}
