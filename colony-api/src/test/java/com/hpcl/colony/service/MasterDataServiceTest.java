package com.hpcl.colony.service;

import com.hpcl.colony.repository.ComplaintCategoryRepository;
import com.hpcl.colony.repository.ComplaintSubcategoryRepository;
import com.hpcl.colony.repository.IfmsMemberRepository;
import com.hpcl.colony.repository.PoItemRepository;
import com.hpcl.colony.repository.StatusCatalogRepository;
import com.hpcl.colony.repository.VendorMappingRepository;
import com.hpcl.colony.repository.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MasterDataServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private VendorMappingRepository vendorMappingRepository;

    @Mock
    private ComplaintCategoryRepository complaintCategoryRepository;

    @Mock
    private ComplaintSubcategoryRepository complaintSubcategoryRepository;

    @Mock
    private PoItemRepository poItemRepository;

    @Mock
    private IfmsMemberRepository ifmsMemberRepository;

    @Mock
    private StatusCatalogRepository statusCatalogRepository;

    @InjectMocks
    private MasterDataService masterDataService;

    @Test
    void getNextPoItemNumberAddsTenToHighestExistingValue() {
        when(poItemRepository.findMaxAgtmItemByPoCategory("CAT")).thenReturn(90);

        assertThat(masterDataService.getNextPoItemNumber("CAT")).isEqualTo(100);
    }

    @Test
    void getNextPoItemNumberStartsAtTenWhenTableIsEmpty() {
        when(poItemRepository.findMaxAgtmItemByPoCategory("CAT")).thenReturn(null);

        assertThat(masterDataService.getNextPoItemNumber("CAT")).isEqualTo(10);
    }
}
