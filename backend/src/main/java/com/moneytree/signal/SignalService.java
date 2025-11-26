package com.moneytree.signal;

import com.moneytree.signal.entity.Signal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for trading signal CRUD operations using Spring Data JPA.
 */
@Service
@Transactional
public class SignalService {

    private static final Logger log = LoggerFactory.getLogger(SignalService.class);

    private final SignalRepository signalRepository;

    public SignalService(SignalRepository signalRepository) {
        this.signalRepository = signalRepository;
    }

    public List<Signal> listSignals() {
        log.info("listSignals called");
        return signalRepository.findAll();
    }

    public List<Signal> listSignalsByPortfolio(Long portfolioId) {
        log.info("listSignalsByPortfolio portfolioId={}", portfolioId);
        return signalRepository.findByPortfolioIdOrderByTimestampDesc(portfolioId);
    }

    public List<Signal> listSignalsBySymbol(String symbol) {
        log.info("listSignalsBySymbol symbol={}", symbol);
        return signalRepository.findBySymbol(symbol);
    }

    public List<Signal> listPendingSignals(Long portfolioId) {
        log.info("listPendingSignals portfolioId={}", portfolioId);
        return signalRepository.findByPortfolioIdAndExecutedFalse(portfolioId);
    }

    public Optional<Signal> getSignal(Integer signalId) {
        log.info("getSignal signalId={}", signalId);
        return signalRepository.findById(signalId);
    }

    public Signal createSignal(Signal signal) {
        log.info("createSignal portfolioId={}, symbol={}, signalType={}",
                signal.getPortfolio().getId(), signal.getSymbol(), signal.getSignalType());
        return signalRepository.save(signal);
    }

    public Signal updateSignal(Signal signal) {
        log.info("updateSignal signalId={}", signal.getSignalId());
        return signalRepository.save(signal);
    }

    public void deleteSignal(Integer signalId) {
        log.info("deleteSignal signalId={}", signalId);
        signalRepository.deleteById(signalId);
    }
}


