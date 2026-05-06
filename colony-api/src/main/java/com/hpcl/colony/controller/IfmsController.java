package com.hpcl.colony.controller;

import com.hpcl.colony.dto.ComplaintDto;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import com.hpcl.colony.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;

/**
 * IFMS Task endpoints:
 *  - My Pending Tasks   (bvg_pending.jsp)   → GET  /api/v1/ifms/pending
 *  - Request List       (bvgAckByMe.jsp)    → GET  /api/v1/ifms/requests
 *  - Raise Proxy Request(proxy_request.jsp) → POST /api/v1/ifms/proxy
 *  - Colony dropdown    (shared)            → GET  /api/v1/ifms/colonies
 *  - Flats by complex   (get_flats.jsp)     → GET  /api/v1/housing/flats
 *  - Employee by flat   (get_flats.jsp)     → GET  /api/v1/housing/employee
 */
@RestController
@RequiredArgsConstructor
public class IfmsController {

    private final ComplaintService complaintService;
    private final HousingComplexRepository complexRepository;
    private final HousingAllotmentRepository allotmentRepository;
    private final StatusCatalogRepository statusRepository;

    // -----------------------------------------------------------------------
    // 1. Colony list for multi-select dropdowns (housing_complex_list, Mumbai)
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/ifms/colonies")
    public List<Map<String, String>> getColonies() {
        return complexRepository.findAll().stream()
                .sorted(Comparator.comparing(c -> c.getComplexName() != null ? c.getComplexName() : ""))
                .map(c -> {
                    Map<String, String> m = new LinkedHashMap<>();
                    m.put("code", c.getComplexCode());
                    m.put("name", c.getComplexName() != null ? c.getComplexName() : c.getComplexCode());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // 2. All statuses (colony_status table) for Request List status multi-select
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/ifms/statuses")
    public List<Map<String, Object>> getAllStatuses() {
        return statusRepository.findAllByOrderByIdAsc().stream()
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("name", s.getName());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // 3. My Pending Tasks  (bvg_pending.jsp)
    //    Filters: complexCodes (multi-select). Shows STATUS = 20 (Submitted).
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/ifms/pending")
    public List<ComplaintDto> getMyPendingTasks(
            @RequestParam(required = false) List<String> complexCodes) {

        List<Long> pendingStatus = List.of(20L);
        return complaintService.listComplaints(
                null, null,
                (complexCodes != null && !complexCodes.isEmpty()) ? complexCodes : null,
                pendingStatus,
                null, null, null, null, null, null);
    }

    // -----------------------------------------------------------------------
    // 4. Request List  (bvgAckByMe.jsp)
    //    Filters: complexCodes, statuses, fromDate, toDate (dd-MMM-yyyy format)
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/ifms/requests")
    public List<ComplaintDto> getRequestList(
            @RequestParam(required = false) List<String> complexCodes,
            @RequestParam(required = false) List<Long> statuses,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        return complaintService.listComplaints(
                fromDate, toDate,
                (complexCodes != null && !complexCodes.isEmpty()) ? complexCodes : null,
                (statuses != null && !statuses.isEmpty()) ? statuses : null,
                null, null, null, null, null, null);
    }

    // -----------------------------------------------------------------------
    // 5. Flats by complex  (get_flats.jsp → list mode)
    //    Returns flat numbers for a given complexCode from housing_alloted
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/housing/flats")
    public List<String> getFlatsByComplex(@RequestParam String complexCode) {
        return allotmentRepository.findByComplexCode(complexCode).stream()
                .map(HousingAllotment::getFlatNo)
                .filter(Objects::nonNull)
                .sorted()
                .distinct()
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // 6. Employee by flat  (get_flats.jsp → lookup mode)
    //    Returns the empNo for a given complexCode + flatNo
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/housing/employee")
    public ResponseEntity<Map<String, String>> getEmployeeByFlat(
            @RequestParam String complexCode,
            @RequestParam String flatNo) {

        return allotmentRepository.findByComplexCode(complexCode).stream()
                .filter(a -> flatNo.equals(a.getFlatNo()))
                .findFirst()
                .map(a -> ResponseEntity.ok(Map.of("empNo", a.getEmpNo() != null ? a.getEmpNo() : "")))
                .orElseGet(() -> ResponseEntity.ok(Map.of("empNo", "")));
    }

    // -----------------------------------------------------------------------
    // 7. Raise Proxy Request  (proxy_request.jsp)
    //    Creates a new complaint on behalf of the supplied employee number.
    //    The logged-in user's empNo is the submitBy; the target empNo is the requester.
    // -----------------------------------------------------------------------
    @PostMapping("/api/v1/ifms/proxy")
    public ResponseEntity<?> raiseProxyRequest(
            @RequestBody Map<String, String> body,
            HttpSession session) {

        String targetEmpNo = body.getOrDefault("empNo", "").trim();
        if (targetEmpNo.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Employee number is required"));
        }

        String loggedInEmpNo = (String) session.getAttribute("EMP_NO");
        if (loggedInEmpNo == null || loggedInEmpNo.isEmpty()) {
            // Fallback: allow passing via body when session is test mode
            loggedInEmpNo = body.getOrDefault("raiserEmpNo", "SYSTEM");
        }

        ComplaintDto dto = new ComplaintDto();
        dto.setEmpNo(targetEmpNo);
        dto.setCompDetails("Proxy request raised by " + loggedInEmpNo);

        // Resolve flat & complex from allotment for targetEmpNo
        List<HousingAllotment> allotments = allotmentRepository.findByEmpNo(targetEmpNo);
        if (!allotments.isEmpty()) {
            dto.setComplexCode(allotments.get(0).getComplexCode());
            dto.setFlatNo(allotments.get(0).getFlatNo());
        }

        ComplaintDto created = complaintService.createComplaint(dto, targetEmpNo);
        return ResponseEntity.ok(created);
    }

    // -----------------------------------------------------------------------
    // 8. Colonies with allotment data  (proxy_request.jsp complex dropdown)
    //    Returns distinct complexes that have allotments (housing_alloted JOIN)
    // -----------------------------------------------------------------------
    @GetMapping("/api/v1/housing/allotment-complexes")
    public List<Map<String, String>> getAllotmentComplexes() {
        Set<String> codes = allotmentRepository.findAll().stream()
                .map(HousingAllotment::getComplexCode)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return complexRepository.findAll().stream()
                .filter(c -> codes.contains(c.getComplexCode()))
                .filter(c -> c.getComplexName() != null)
                .sorted(Comparator.comparing(HousingComplex::getComplexName))
                .map(c -> {
                    Map<String, String> m = new LinkedHashMap<>();
                    m.put("code", c.getComplexCode());
                    m.put("name", c.getComplexName() + " (" + c.getComplexCode() + ")");
                    return m;
                })
                .collect(Collectors.toList());
    }
}
