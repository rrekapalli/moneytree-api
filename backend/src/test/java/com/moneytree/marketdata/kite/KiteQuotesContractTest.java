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
class KiteQuotesContractTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void quotesEndpointRespondsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/marketdata/kite/quotes")
                        .param("symbols", "INFY,NIFTY50"))
                .andExpect(status().isOk());
    }
}


