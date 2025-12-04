package com.moneytree.marketdata.kite;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class KiteHistoryEdgeCasesTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void invalidDateRangeReturnsBadRequest() throws Exception {
        String requestBody = """
                {
                    "tradingsymbol": "test-token",
                    "instrumenttoken": "test-token",
                    "exchange": "NSE",
                    "interval": "1m",
                    "from": "2024-01-02T09:30:00Z",
                    "to": "2024-01-01T09:30:00Z"
                }
                """;
        
        mockMvc.perform(post("/api/marketdata/kite/test-token/history")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }
}


