package com.hpcl.colony.controller;

import com.hpcl.colony.config.JwtUtil;
import com.hpcl.colony.config.SecurityConfig;
import com.hpcl.colony.dto.auth.LoginRequest;
import com.hpcl.colony.dto.auth.LoginResponse;
import com.hpcl.colony.exception.AuthenticationFailedException;
import com.hpcl.colony.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @Value("${app.security.pin:}")
    private String securityPin;

    @Value("${app.sso.url:}")
    private String ssoUrl;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        setJwtCookie(response, loginResponse.getEmpNo(), loginResponse.getRoles());
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        clearJwtCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<LoginResponse> getCurrentUser(HttpServletRequest request) {
        // Try to read empNo from the JWT cookie (even though /me is permitAll)
        String empNo = extractEmpNoFromCookie(request);
        if (empNo == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getCurrentUserProfile(empNo));
    }

    @PostMapping("/security-login")
    public ResponseEntity<?> securityLogin(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) {
        String pin = request.get("pin");
        if (!StringUtils.hasText(securityPin)) {
            throw new IllegalStateException("Security login PIN is not configured");
        }
        if (!securityPin.equals(pin)) {
            throw new AuthenticationFailedException("Invalid PIN");
        }

        LoginResponse loginResponse = LoginResponse.builder()
                .empNo("SECURITY")
                .name("Security User")
                .role("SECURITY")
                .roles(List.of("SECURITY"))
                .redirectUrl("/app/security/home")
                .build();

        setJwtCookie(response, loginResponse.getEmpNo(), loginResponse.getRoles());
        return ResponseEntity.ok(loginResponse);
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
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.getCurrentUserProfile(empNo);
        setJwtCookie(response, loginResponse.getEmpNo(), loginResponse.getRoles());
        return ResponseEntity.ok(loginResponse);
    }

    // ---- Helper methods ----

    private void setJwtCookie(HttpServletResponse response, String empNo, List<String> roles) {
        String token = jwtUtil.generateToken(empNo, roles);
        Cookie cookie = new Cookie(SecurityConfig.JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true);        // Not accessible via JavaScript
        cookie.setSecure(false);         // Set to true in production (HTTPS)
        cookie.setPath("/");             // Available to both frontend and API paths
        cookie.setMaxAge((int) (jwtExpirationMs / 1000));
        response.addCookie(cookie);
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(SecurityConfig.JWT_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);             // Immediately expire
        response.addCookie(cookie);
    }

    private String extractEmpNoFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (SecurityConfig.JWT_COOKIE_NAME.equals(cookie.getName())) {
                String token = cookie.getValue();
                if (jwtUtil.validateToken(token)) {
                    return jwtUtil.getEmpNoFromToken(token);
                }
            }
        }
        return null;
    }
}
