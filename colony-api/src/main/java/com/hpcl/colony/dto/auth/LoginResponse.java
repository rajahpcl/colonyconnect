package com.hpcl.colony.dto.auth;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String empNo;
    private String name;
    private String role;
    private List<String> roles;
    private String complexCode;
    private boolean vehicleRegistered;
    private String redirectUrl;
}