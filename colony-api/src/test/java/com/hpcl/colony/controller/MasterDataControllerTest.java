package com.hpcl.colony.controller;

import com.hpcl.colony.config.SecurityConfig;
import com.hpcl.colony.entity.Vendor;
import com.hpcl.colony.service.MasterDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MasterDataController.class)
@Import(SecurityConfig.class)
class MasterDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MasterDataService masterDataService;

    @Test
    @WithMockUser(username = "31982600")
    void getNextPoItemNumberReturnsServiceResult() throws Exception {
        when(masterDataService.getNextPoItemNumber("CIVIL")).thenReturn(120);

        mockMvc.perform(get("/api/v1/masters/po-items/next-number").param("poCategory", "CIVIL"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextNumber").value(120));
    }

    @Test
    @WithMockUser(username = "31982600")
    void getVendorByCodeReturnsNotFoundWhenVendorDoesNotExist() throws Exception {
        when(masterDataService.getVendorByCode("V001")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/masters/vendors/by-code/V001"))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "31982600")
    void getVendorByCodeReturnsVendorWhenFound() throws Exception {
        Vendor vendor = Vendor.builder()
            .id(10L)
            .code("V001")
            .name("A-One Services")
            .categoryId(1L)
            .active(null) // null = active
            .build();

        when(masterDataService.getVendorByCode("V001")).thenReturn(Optional.of(vendor));

        mockMvc.perform(get("/api/v1/masters/vendors/by-code/V001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("V001"))
            .andExpect(jsonPath("$.name").value("A-One Services"));
    }
}
