package com.hpcl.colony.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Employee number is required")
    private String empNo;

    @NotBlank(message = "Password is required")
    private String password;
}