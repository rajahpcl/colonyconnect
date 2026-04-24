package com.hpcl.colony.service;

import com.hpcl.colony.entity.VendorMapping;
import com.hpcl.colony.repository.VendorMappingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VendorRoutingService {

    private final VendorMappingRepository vendorMappingRepository;

    /**
     * Resolve vendor number for a given complex/building/category.
     * Falls back to "ALL" building if exact match not found (legacy behavior).
     */
    public Optional<String> resolveVendorCode(String complexCode, String building, Long categoryId) {
        // Try exact building match first
        List<VendorMapping> exactMatches = vendorMappingRepository
            .findByComplexCodeAndBuildingAndCategoryIdAndActive(
                complexCode, building, categoryId, "A");

        if (!exactMatches.isEmpty()) {
            return Optional.of(exactMatches.get(0).getVendorNumber());
        }

        // Fallback to "ALL" building
        List<VendorMapping> fallbackMatches = vendorMappingRepository
            .findByComplexCodeAndBuildingAndCategoryIdAndActive(
                complexCode, "ALL", categoryId, "A");

        if (!fallbackMatches.isEmpty()) {
            return Optional.of(fallbackMatches.get(0).getVendorNumber());
        }

        return Optional.empty();
    }
}
