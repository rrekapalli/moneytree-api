package com.moneytree.api;

import com.moneytree.screener.ScreenerScheduleService;
import com.moneytree.screener.entity.ScreenerSchedule;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screeners/{screenerId}/schedules")
@Tag(name = "Screener Schedules", description = "Scheduled screener execution configuration")
public class ScreenerScheduleController {

    private final ScreenerScheduleService service;

    public ScreenerScheduleController(ScreenerScheduleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerSchedule>> listSchedules(@PathVariable UUID screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerSchedule> getSchedule(@PathVariable UUID screenerId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerSchedule> createSchedule(@PathVariable UUID screenerId, @RequestBody ScreenerSchedule schedule) {
        return ResponseEntity.ok(service.save(schedule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerSchedule> updateSchedule(@PathVariable UUID screenerId, @PathVariable UUID id, @RequestBody ScreenerSchedule schedule) {
        schedule.setScheduleId(id);
        return ResponseEntity.ok(service.save(schedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID screenerId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

