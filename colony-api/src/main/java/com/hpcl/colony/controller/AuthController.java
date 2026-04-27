package com.hpcl.colony.controller;

import com.hpcl.colony.dto.auth.LoginRequest;
import com.hpcl.colony.dto.auth.LoginResponse;
import com.hpcl.colony.exception.AuthenticationFailedException;
import com.hpcl.colony.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Value("${app.security.pin:}")
    private String securityPin;

    @Value("${app.sso.url:}")
    private String ssoUrl;

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(CsrfToken csrfToken) {
        return ResponseEntity.ok(Map.of("token", csrfToken.getToken()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session) {
        LoginResponse response = authService.login(request);
        storeSession(session, response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(HttpSession session) {
        String empNo = (String) session.getAttribute("EMP_NO");
        if (empNo == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(authService.getCurrentUserProfile(empNo));
    }

    @PostMapping("/security-login")
    public ResponseEntity<?> securityLogin(
            @RequestBody Map<String, String> request,
            HttpSession session) {
        String pin = request.get("pin");
        if (!StringUtils.hasText(securityPin)) {
            throw new IllegalStateException("Security login PIN is not configured");
        }
        if (!securityPin.equals(pin)) {
            throw new AuthenticationFailedException("Invalid PIN");
        }

        LoginResponse response = LoginResponse.builder()
                .empNo("SECURITY")
                .name("Security User")
                .role("SECURITY")
                .roles(List.of("SECURITY"))
                .redirectUrl("/app/security/home")
                .build();
        storeSession(session, response);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sso/start")
    public ResponseEntity<?> startSso() {
        if (!StringUtils.hasText(ssoUrl)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "SSO is not configured"));
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(ssoUrl))
                .build();
    }

    @GetMapping("/sso/callback")
    public ResponseEntity<LoginResponse> ssoCallback(
            @RequestParam String empNo,
            HttpSession session) {
        LoginResponse response = authService.getCurrentUserProfile(empNo);
        storeSession(session, response);
        return ResponseEntity.ok(response);
    }

    private void storeSession(HttpSession session, LoginResponse response) {
        session.setAttribute("EMP_NO", response.getEmpNo());
        session.setAttribute("ROLE", response.getRole());
        session.setAttribute("ROLES", response.getRoles());
    }
}
