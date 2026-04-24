package com.hpcl.colony.controller;

import com.hpcl.colony.config.SecurityConfig;
import com.hpcl.colony.dto.auth.LoginResponse;
import com.hpcl.colony.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void getCurrentUserReturnsProfileFromSessionWithoutReauthenticating() throws Exception {
        LoginResponse response = LoginResponse.builder()
            .empNo("31982600")
            .name("Colony Admin")
            .role("ADMIN")
            .roles(List.of("ADMIN"))
            .redirectUrl("/app/admin/dashboard")
            .build();

        when(authService.getCurrentUserProfile("31982600")).thenReturn(response);

        mockMvc.perform(get("/api/v1/auth/me").sessionAttr("EMP_NO", "31982600"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.empNo").value("31982600"))
            .andExpect(jsonPath("$.role").value("ADMIN"))
            .andExpect(jsonPath("$.redirectUrl").value("/app/admin/dashboard"));

        verify(authService).getCurrentUserProfile("31982600");
        verify(authService, never()).login(any());
    }
}
