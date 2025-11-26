# MoneyTree API

A Java-based REST API for personal finance management built with Spring Boot.

## Features

- **Account Management**: Create, read, update, and delete financial accounts
- **Transaction Tracking**: Record and manage financial transactions
- **Category Support**: Organize transactions by categories
- **Date Range Queries**: Filter transactions by date ranges

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Spring Data JPA
- H2 Database (for development)
- Maven

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Build

```bash
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

### Run Tests

```bash
mvn test
```

## API Endpoints

### Health Check

- `GET /api/health` - Check application health

### Accounts

- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/{id}` - Get account by ID
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account
- `GET /api/accounts/type/{accountType}` - Get accounts by type

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/{id}` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/account/{accountId}` - Get transactions by account
- `GET /api/transactions/type/{transactionType}` - Get transactions by type
- `GET /api/transactions/category/{category}` - Get transactions by category
- `GET /api/transactions/daterange?start={datetime}&end={datetime}` - Get transactions by date range

## Example Requests

### Create an Account

```bash
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"name": "Checking Account", "balance": 1000.00, "accountType": "CHECKING"}'
```

### Create a Transaction

```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.00, "description": "Grocery shopping", "transactionType": "EXPENSE", "category": "GROCERIES", "accountId": 1}'
```

## Development

### H2 Console

During development, the H2 database console is available at:
`http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:mem:moneytreedb`
- Username: `sa`
- Password: (empty)

## Project Structure

```
src/
├── main/
│   ├── java/com/moneytree/api/
│   │   ├── controller/     # REST controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # JPA repositories
│   │   ├── service/        # Business logic
│   │   └── MoneyTreeApiApplication.java
│   └── resources/
│       └── application.properties
└── test/
    └── java/com/moneytree/api/
        ├── controller/     # Controller tests
        └── service/        # Service tests
```

## License

This project is open source.