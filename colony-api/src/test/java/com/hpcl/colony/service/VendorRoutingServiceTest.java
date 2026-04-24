package com.hpcl.colony.service;

import com.hpcl.colony.entity.VendorMapping;
import com.hpcl.colony.repository.VendorMappingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendorRoutingServiceTest {

    @Mock
    private VendorMappingRepository vendorMappingRepository;

    @InjectMocks
    private VendorRoutingService vendorRoutingService;

    @Test
    void resolveVendorCodePrefersExactBuildingMapping() {
        when(vendorMappingRepository.findByComplexCodeAndBuildingAndCategoryIdAndActive(
            "MUMBAI", "B1", 4L, "A"))
            .thenReturn(List.of(VendorMapping.builder().vendorNumber("V-EXACT").build()));

        Optional<String> resolvedVendor = vendorRoutingService.resolveVendorCode("MUMBAI", "B1", 4L);

        assertThat(resolvedVendor).contains("V-EXACT");
        verify(vendorMappingRepository, never())
            .findByComplexCodeAndBuildingAndCategoryIdAndActive("MUMBAI", "ALL", 4L, "A");
    }

    @Test
    void resolveVendorCodeFallsBackToAllBuildingMapping() {
        when(vendorMappingRepository.findByComplexCodeAndBuildingAndCategoryIdAndActive(
            "MUMBAI", "B1", 4L, "A"))
            .thenReturn(List.of());
        when(vendorMappingRepository.findByComplexCodeAndBuildingAndCategoryIdAndActive(
            "MUMBAI", "ALL", 4L, "A"))
            .thenReturn(List.of(VendorMapping.builder().vendorNumber("V-FALLBACK").build()));

        Optional<String> resolvedVendor = vendorRoutingService.resolveVendorCode("MUMBAI", "B1", 4L);

        assertThat(resolvedVendor).contains("V-FALLBACK");
        verify(vendorMappingRepository)
            .findByComplexCodeAndBuildingAndCategoryIdAndActive("MUMBAI", "ALL", 4L, "A");
    }
}
