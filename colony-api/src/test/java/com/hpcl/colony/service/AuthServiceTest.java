package com.hpcl.colony.service;

import com.hpcl.colony.dto.auth.LoginResponse;
import com.hpcl.colony.entity.HousingComplex;
import com.hpcl.colony.entity.User;
import com.hpcl.colony.repository.HousingComplexRepository;
import com.hpcl.colony.repository.IfmsMemberRepository;
import com.hpcl.colony.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HousingComplexRepository housingComplexRepository;

    @Mock
    private IfmsMemberRepository ifmsMemberRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void getCurrentUserProfileReturnsResolvedRolesForAdmin() {
        User user = User.builder()
            .empNo("31982600")
            .name("Colony Admin")
            .build();

        HousingComplex complex = HousingComplex.builder()
            .complexCode("MUMBAI")
            .complexName("Mumbai Complex")
            .complexAdmin("31982600")
            .build();

        when(userRepository.findByEmpNo("31982600")).thenReturn(Optional.of(user));
        when(housingComplexRepository.findByComplexAdminContaining("31982600")).thenReturn(List.of(complex));
        when(ifmsMemberRepository.findByBvgTeamMemberIdAndStatusGreaterThan("31982600", 0)).thenReturn(Optional.empty());

        LoginResponse response = authService.getCurrentUserProfile("31982600");

        assertThat(response.getEmpNo()).isEqualTo("31982600");
        assertThat(response.getRoles()).containsExactly("COMPLEX_ADMIN");
        assertThat(response.getRedirectUrl()).isEqualTo("/app/admin/dashboard");
        assertThat(response.getComplexCode()).isEqualTo("MUMBAI");
    }
}
