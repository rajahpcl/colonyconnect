package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PoSubmittedService {
    private final PoSubmittedRepository repository;
    private final PoItemRepository poItemRepository;

    public List<PoSubmitted> findAll() {
        return repository.findAll();
    }

    public PoSubmitted findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("PoSubmitted not found: " + id));
    }

    public List<PoSubmitted> findByReqId(String reqId) {
        return repository.findAll().stream()
            .filter(p -> reqId.equals(p.getReqId()) && p.getStatus() != null && p.getStatus() > 0)
            .collect(Collectors.toList());
    }

    @Transactional
    public PoSubmitted save(PoSubmitted po) {
        po.setInsertedOn(LocalDateTime.now());
        return repository.save(po);
    }

    @Transactional
    public void addPoItem(PoSubmitted po, String insertedBy) {
        po.setInsertedBy(insertedBy);
        po.setInsertedOn(LocalDateTime.now());
        po.setStatus(1); // Active
        repository.save(po);
    }

    @Transactional
    public void delete(Long id) {
        PoSubmitted po = findById(id);
        po.setStatus(0); // Soft delete
        repository.save(po);
    }

    // PO Master operations
    public List<PoItem> findAllPoItems() {
        return poItemRepository.findAll().stream()
            .filter(p -> p.getStatus() != null && p.getStatus() > 0)
            .collect(Collectors.toList());
    }

    public List<PoItem> findPoItemsByCategory(String category) {
        return poItemRepository.findAll().stream()
            .filter(p -> p.getStatus() != null && p.getStatus() > 0)
            .filter(p -> category.equals(p.getPoCategory()))
            .collect(Collectors.toList());
    }

    public PoItem findPoItemById(Long id) {
        return poItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("PoItem not found: " + id));
    }

    public String getNextAgtmItem(String poCategory) {
        List<PoItem> items = findPoItemsByCategory(poCategory);
        if (items.isEmpty()) {
            return "1";
        }
        int max = items.stream()
            .filter(p -> p.getAgtmItem() != null)
            .mapToInt(p -> {
                try {
                    return Integer.parseInt(p.getAgtmItem());
                } catch (NumberFormatException e) {
                    return 0;
                }
            })
            .max()
            .orElse(0);
        return String.valueOf(max + 1);
    }

    @Transactional
    public PoItem savePoItem(PoItem item, String insertedBy) {
        item.setInsertedBy(insertedBy);
        item.setInsertedOn(new java.sql.Timestamp(System.currentTimeMillis()));
        item.setStatus(1);
        return poItemRepository.save(item);
    }

    @Transactional
    public void softDeletePoItem(Long id) {
        PoItem item = findPoItemById(id);
        item.setStatus(0);
        poItemRepository.save(item);
    }

    public List<String> getPoCategories() {
        return poItemRepository.findAll().stream()
            .filter(p -> p.getStatus() != null && p.getStatus() > 0)
            .map(PoItem::getPoCategory)
            .distinct()
            .collect(Collectors.toList());
    }
}