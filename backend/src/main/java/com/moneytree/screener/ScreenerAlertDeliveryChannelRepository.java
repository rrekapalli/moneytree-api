package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerAlertDeliveryChannel;
import com.moneytree.screener.entity.ScreenerAlertDeliveryChannelId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenerAlertDeliveryChannelRepository extends JpaRepository<ScreenerAlertDeliveryChannel, ScreenerAlertDeliveryChannelId> {

    List<ScreenerAlertDeliveryChannel> findByAlertId(Long alertId);
}

