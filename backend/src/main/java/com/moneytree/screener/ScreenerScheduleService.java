package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSchedule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ScreenerScheduleService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerScheduleService.class);
    private final ScreenerScheduleRepository repository;

    public ScreenerScheduleService(ScreenerScheduleRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerSchedule> findByScreenerId(UUID screenerId) {
        return repository.findByScreenerId(screenerId);
    }

    public Optional<ScreenerSchedule> findById(UUID id) {
        return repository.findById(id);
    }

    public ScreenerSchedule save(ScreenerSchedule schedule) {
        return repository.save(schedule);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

