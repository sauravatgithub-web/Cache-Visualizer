## [🔗 Cache Simulator (Live)](https://cache-visualizer.vercel.app/)

This project helps in understanding the working of cache as in real CPU. It demonstrates 3 types of cache - Direct Mapped, Fully Associative and Set Associative as well as different set of write policies. The web page provides an interactive application to work with, while the backend provides the logic behind the working.

# Features
  * Support cache read/write operations
  * Support for:
  
    * Direct Mapped
    * Set-Associative 
    * Fully Associative
  * Replacement policies:
  
    * **FIFO**
    * **LRU**
    * **LFU**
    * **RANDOM**
  * Write policies:
  
    * **Write-Through**
    * **Write-Back**
    * **Write-No-Allocate**
    * **Write-Allocate**
  * Memory visualization
  * Configurable:
  
    * Cache size
    * Block size
    * Word size
    * Number of ways
    * Replacement Policy
    * Write Policy
  * Detailed response showing cache state, block data, hit/miss, and more
  * Flow diagrams for CPU Request and CPU Response
  * CPU Logs
## Tech Stack

| Layer         | Technology             |
| ------------- | ---------------------- |
| Frontend      | React.js, Tailwind CSS |
| Backend       | Java (Spring Boot)     |
| Communication | REST API (JSON)        |

## Project Structure

```
backend/                     # Spring Boot application
     ├── controller/         # API endpoints
     ├── model/              # Core logic: cache, memory, block
     ├── dto/                # Request/response structures
     └── CacheApplication.java

frontend/                # React frontend
     ├── src/
     ├── components/     # UI components
     ├── api/            # Axios-based API hooks
     └── App.jsx         # Entry point

README.md
```

## Setup Instructions

### Prerequisites

* Java 17+ (for backend)
* Node.js 16+ and npm/yarn (for frontend)


### Backend Setup

```bash
cd backend/
./mvnw spring-boot:run
```

By default, the server runs on: `http://localhost:8080`

### Frontend Setup

```bash
cd frontend/
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Github Link
* [Frontend Repository](https://github.com/sauravatgithub-web/Cache-Visualizer.git)
* [Backend Repository](https://github.com/pntu007/cache_api.git)

## Contributors

* Saurav Singh
* Harsh Maurya
