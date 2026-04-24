package com.hpcl.colony.service;

import com.hpcl.colony.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
public class RoleService {

    public List<String> resolveRoles(User user) {
        LinkedHashSet<String> resolvedRoles = new LinkedHashSet<>();
        if (user == null || !StringUtils.hasText(user.getRole())) {
            return List.of();
        }

        String primaryRole = normalizeRole(user.getRole());
        resolvedRoles.add(primaryRole);

        if ("ADMIN".equals(primaryRole) || "SYSTEM_ADMIN".equals(primaryRole)) {
            resolvedRoles.add("COMPLEX_ADMIN");
        }

        return new ArrayList<>(resolvedRoles);
    }

    public String determineRedirectUrl(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return "/app/home";
        }

        if (roles.contains("SYSTEM_ADMIN") || roles.contains("ADMIN") || roles.contains("COMPLEX_ADMIN")) {
            return "/app/admin/dashboard";
        }
        if (roles.contains("IFMS")) {
            return "/app/ifms/pending";
        }
        if (roles.contains("SECURITY")) {
            return "/app/security/home";
        }
        if (roles.contains("VENDOR")) {
            return "/app/vendor/requests";
        }

        return "/app/home";
    }

    private String normalizeRole(String role) {
        return role.trim().toUpperCase().replace('-', '_').replace(' ', '_');
    }
}
