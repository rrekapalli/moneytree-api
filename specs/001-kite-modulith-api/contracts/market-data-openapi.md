```yaml
openapi: 3.0.0
info:
  title: MoneyTree Kite Market Data API
  version: 0.1.0
  description: >
    High-level contract sketch for Kite-backed market data endpoints replacing legacy NSE-based APIs.
    This document is a planning artifact and does not prescribe implementation details.

paths:
  /api/marketdata/kite/instruments:
    get:
      summary: List tradable instruments available via Kite
      description: Returns a filtered list of instruments, aligned with existing NSE instrument discovery endpoints where possible.
      parameters:
        - name: exchange
          in: query
          schema:
            type: string
        - name: type
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of instruments
  /api/marketdata/kite/{symbol}/history:
    get:
      summary: Get historical price data (candles) for a symbol
      parameters:
        - name: symbol
          in: path
          required: true
          schema:
            type: string
        - name: interval
          in: query
          schema:
            type: string
        - name: from
          in: query
          schema:
            type: string
            format: date-time
        - name: to
          in: query
          schema:
            type: string
            format: date-time
      responses:
        '200':
          description: Time-series candle data backed by kite_* tables
  /api/marketdata/kite/quotes:
    get:
      summary: Get latest quotes for one or more symbols
      parameters:
        - name: symbols
          in: query
          required: true
          schema:
            type: array
            items:
              type: string
      responses:
        '200':
          description: Quote snapshots aligned with legacy NSE quote responses where fields are available
```


