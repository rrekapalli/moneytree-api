package com.moneytree.marketdata.kite;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class KiteHistoryEdgeCasesTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void invalidDateRangeReturnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/marketdata/kite/test-token/history")
                        .param("interval", "1m")
                        .param("from", "2024-01-02T09:30:00Z")
                        .param("to", "2024-01-01T09:30:00Z"))
                .andExpect(status().isBadRequest());
    }
}


