package com.hpcl.colony.service;

import com.hpcl.colony.dto.auth.LoginRequest;
import com.hpcl.colony.dto.auth.LoginResponse;
import com.hpcl.colony.entity.HousingComplex;
import com.hpcl.colony.entity.IfmsMember;
import com.hpcl.colony.entity.User;
import com.hpcl.colony.exception.AuthenticationFailedException;
import com.hpcl.colony.exception.ResourceNotFoundException;
import com.hpcl.colony.repository.HousingComplexRepository;
import com.hpcl.colony.repository.IfmsMemberRepository;
import com.hpcl.colony.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final HousingComplexRepository housingComplexRepository;
    private final IfmsMemberRepository ifmsMemberRepository;
    private final com.hpcl.colony.repository.HousingAllotmentRepository housingAllotmentRepository;

    public AuthService(UserRepository userRepository, 
                       HousingComplexRepository housingComplexRepository, 
                       IfmsMemberRepository ifmsMemberRepository,
                       com.hpcl.colony.repository.HousingAllotmentRepository housingAllotmentRepository) {
        this.userRepository = userRepository;
        this.housingComplexRepository = housingComplexRepository;
        this.ifmsMemberRepository = ifmsMemberRepository;
        this.housingAllotmentRepository = housingAllotmentRepository;
    }

    public LoginResponse login(LoginRequest request) {
        User user = findUser(request.getEmpNo());

        // Hardcoded password "1234" for authentication bypass (dev mode)
        if (!"1234".equals(request.getPassword())) {
            // In production, this should validate against LDAP
            // For now, reject non-bypass passwords
            throw new AuthenticationFailedException("Invalid credentials");
        }

        return buildLoginResponse(user);
    }

    public LoginResponse getCurrentUserProfile(String empNo) {
        return buildLoginResponse(findUser(empNo));
    }

    public User getCurrentUser(String empNo) {
        return findUser(empNo);
    }

    private LoginResponse buildLoginResponse(User user) {
        List<String> roles = resolveRoles(user);
        String primaryRole = roles.isEmpty() ? "RESIDENT" : roles.get(0);

        // Determine complex code from housing_complex_list if user is admin
        String complexCode = null;
        String complexName = null;
        String flatNo = null;

        List<HousingComplex> adminComplexes = housingComplexRepository.findByComplexAdminContaining(user.getEmpNo());
        if (!adminComplexes.isEmpty()) {
            complexCode = adminComplexes.get(0).getComplexCode();
            complexName = adminComplexes.get(0).getName();
        } else {
            // If not an admin, try to get from housing allotment
            List<com.hpcl.colony.entity.HousingAllotment> allotments = housingAllotmentRepository.findByEmpNo(user.getEmpNo());
            if (!allotments.isEmpty()) {
                com.hpcl.colony.entity.HousingAllotment allotment = allotments.get(0);
                complexCode = allotment.getComplexCode();
                flatNo = allotment.getFlatNo();
                
                housingComplexRepository.findById(complexCode).ifPresent(complex -> {
                    // However, we need a mutable string reference, so we handle it below
                });
                
                // Fetch complex name
                Optional<HousingComplex> hc = housingComplexRepository.findById(complexCode);
                if (hc.isPresent()) {
                    complexName = hc.get().getName();
                }
            }
        }

        return LoginResponse.builder()
                .empNo(user.getEmpNo())
                .name(user.getName())
                .role(primaryRole)
                .roles(roles)
                .complexCode(complexCode)
                .complexName(complexName)
                .flatNo(flatNo)
                .vehicleRegistered(false) // TODO: Check COLONY_VEHICLEINFO
                .redirectUrl(determineRedirectUrl(roles))
                .build();
    }

    private List<String> resolveRoles(User user) {
        List<String> roles = new ArrayList<>();

        // Check if user is a complex admin
        List<HousingComplex> adminComplexes = housingComplexRepository.findByComplexAdminContaining(user.getEmpNo());
        if (!adminComplexes.isEmpty()) {
            roles.add("COMPLEX_ADMIN");
        }

        // Check if user is an IFMS/BVG team member
        Optional<IfmsMember> ifmsMember = ifmsMemberRepository
                .findByBvgTeamMemberIdAndStatusGreaterThan(user.getEmpNo(), 0);
        if (ifmsMember.isPresent()) {
            roles.add("IFMS");
        }

        // Default role for regular employees
        if (roles.isEmpty()) {
            roles.add("RESIDENT");
        }

        return roles;
    }

    private String determineRedirectUrl(List<String> roles) {
        if (roles.contains("COMPLEX_ADMIN")) {
            return "/app/admin/dashboard";
        }
        if (roles.contains("IFMS")) {
            return "/app/ifms/pending";
        }
        return "/app/home";
    }

    private User findUser(String empNo) {
        return userRepository.findByEmpNo(empNo)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + empNo));
    }
}
