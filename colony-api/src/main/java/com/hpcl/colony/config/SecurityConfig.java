package com.hpcl.colony.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Spring Security 6.x requires explicit handler for CookieCsrfTokenRepository.
        // Without this, deferred CSRF tokens cause 403 on ALL authenticated requests.
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
        // Setting to null disables BREACH protection so the raw token can be used by SPA clients
        csrfHandler.setCsrfRequestAttributeName(null);

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(csrfHandler)
                .ignoringRequestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/security-login",
                    "/api/v1/auth/sso/**"))
            .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
            .addFilterBefore(new SessionAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/auth/login",
                    "/api/v1/auth/me",
                    "/api/v1/auth/security-login",
                    "/api/v1/auth/sso/**",
                    "/api/v1/auth/csrf",
                    "/api/v1/health").permitAll()
                .anyRequest().authenticated())
            .logout(logout -> logout
                .logoutUrl("/api/v1/auth/logout")
                .logoutSuccessUrl("/login?loggedOut"));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Filter that bridges our custom session-based auth to Spring Security.
     * 
     * The AuthController.login() stores EMP_NO and ROLES in HttpSession,
     * but Spring Security's .authenticated() check looks at SecurityContextHolder.
     * This filter reads the session attributes and creates a proper Authentication
     * object so Spring Security recognizes the user as authenticated.
     */
    private static class SessionAuthenticationFilter extends OncePerRequestFilter {
        @Override
        @SuppressWarnings("unchecked")
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                HttpSession session = request.getSession(false);
                if (session != null) {
                    String empNo = (String) session.getAttribute("EMP_NO");
                    if (empNo != null) {
                        List<String> roles = (List<String>) session.getAttribute("ROLES");
                        List<SimpleGrantedAuthority> authorities = (roles != null)
                            ? roles.stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                .collect(Collectors.toList())
                            : List.of(new SimpleGrantedAuthority("ROLE_RESIDENT"));

                        UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(empNo, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Filter that eagerly loads the CsrfToken so the cookie is always written.
     * Required for SPA clients that read XSRF-TOKEN from cookies.
     */
    private static class CsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            if (csrfToken != null) {
                // Force the token to be rendered, which writes the XSRF-TOKEN cookie
                csrfToken.getToken();
            }
            filterChain.doFilter(request, response);
        }
    }
}

