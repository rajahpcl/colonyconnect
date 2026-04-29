package com.hpcl.colony.service;

import com.hpcl.colony.dto.InventoryDto;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryMainRepository mainRepository;
    private final InventoryEntryRepository entryRepository;
    private final InventoryHistoryRepository historyRepository;
    private final InventoryMasterRepository masterRepository;

    public List<InventoryMain> findAll() {
        return mainRepository.findAll();
    }

    public InventoryMain findById(Long id) {
        return mainRepository.findById(id).orElseThrow(() -> new RuntimeException("InventoryMain not found: " + id));
    }

    public List<InventoryMain> findByEmpNo(String empNo) {
        return mainRepository.findAll().stream()
            .filter(inv -> empNo.equals(inv.getEmpNo()))
            .collect(Collectors.toList());
    }

    @Transactional
    public InventoryMain save(InventoryMain inventory) {
        inventory.setUpdateDate(LocalDateTime.now());
        return mainRepository.save(inventory);
    }

    @Transactional
    public InventoryMain createOrUpdateWithEntries(InventoryMain inventory, List<InventoryEntry> entries,
                                                    String status, String updateBy) {
        inventory.setStatus(status);
        inventory.setUpdateBy(updateBy);
        inventory.setUpdateDate(LocalDateTime.now());

        InventoryMain saved = mainRepository.save(inventory);

        for (InventoryEntry entry : entries) {
            entry.setMainId(saved.getId());
            if (entry.getId() == null) {
                entryRepository.save(entry);
            } else {
                entryRepository.save(entry);
            }
        }

        return saved;
    }

    @Transactional
    public void submitForApproval(Long id, String updateBy) {
        InventoryMain inv = findById(id);
        inv.setStatus("20"); // Submitted
        inv.setUpdateBy(updateBy);
        inv.setUpdateDate(LocalDateTime.now());
        mainRepository.save(inv);

        // Add history
        InventoryHistory history = InventoryHistory.builder()
            .mainId(id)
            .status("20")
            .updateBy(updateBy)
            .updateDate(LocalDateTime.now())
            .remarks("")
            .build();
        historyRepository.save(history);
    }

    @Transactional
    public void approve(Long id, String approvedBy) {
        InventoryMain inv = findById(id);
        inv.setStatus("30"); // Approved
        inv.setUpdateBy(approvedBy);
        inv.setUpdateDate(LocalDateTime.now());
        mainRepository.save(inv);

        // Add history
        InventoryHistory history = InventoryHistory.builder()
            .mainId(id)
            .status("30")
            .updateBy(approvedBy)
            .updateDate(LocalDateTime.now())
            .remarks("")
            .build();
        historyRepository.save(history);
    }

    @Transactional
    public void sendBack(Long id, String updateBy) {
        InventoryMain inv = findById(id);
        inv.setStatus("11"); // Send back to draft
        inv.setUpdateBy(updateBy);
        inv.setUpdateDate(LocalDateTime.now());
        mainRepository.save(inv);

        // Add history
        InventoryHistory history = InventoryHistory.builder()
            .mainId(id)
            .status("11")
            .updateBy(updateBy)
            .updateDate(LocalDateTime.now())
            .remarks("")
            .build();
        historyRepository.save(history);
    }

    @Transactional
    public void delete(Long id) {
        // Delete entries first
        List<InventoryEntry> entries = entryRepository.findByMainId(id);
        entryRepository.deleteAll(entries);

        // Delete history
        List<InventoryHistory> history = historyRepository.findByMainIdOrderByUpdateDateDesc(id);
        historyRepository.deleteAll(history);

        // Delete main
        mainRepository.deleteById(id);
    }

    public List<InventoryMaster> getInventoryMaster() {
        return masterRepository.findAllByOrderByCategoryAscIdAsc();
    }

    public List<InventoryMaster> getMasterByCategory(String category) {
        return masterRepository.findByCategoryOrderById(category);
    }

    public List<InventoryHistory> getHistory(Long mainId) {
        return historyRepository.findByMainIdOrderByUpdateDateDesc(mainId);
    }
}