package com.moneytree.api;

import com.moneytree.screener.ScreenerScheduleService;
import com.moneytree.screener.entity.ScreenerSchedule;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screeners/{screenerId}/schedules")
public class ScreenerScheduleController {

    private final ScreenerScheduleService service;

    public ScreenerScheduleController(ScreenerScheduleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerSchedule>> listSchedules(@PathVariable Long screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerSchedule> getSchedule(@PathVariable Long screenerId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerSchedule> createSchedule(@PathVariable Long screenerId, @RequestBody ScreenerSchedule schedule) {
        return ResponseEntity.ok(service.save(schedule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerSchedule> updateSchedule(@PathVariable Long screenerId, @PathVariable Long id, @RequestBody ScreenerSchedule schedule) {
        schedule.setScheduleId(id);
        return ResponseEntity.ok(service.save(schedule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long screenerId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

