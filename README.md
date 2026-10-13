# GramVikas (ग्रामविकास)
### Offline-First Smart Business Management System for Rural Entrepreneurs in Maharashtra

[![Java](https://img.shields.io/badge/Backend-Java%2017-orange.svg)](https://adoptium.net/)
[![Python](https://img.shields.io/badge/Agro--BI-Python%203.14-blue.svg)](https://python.org/)
[![C++](https://img.shields.io/badge/Native%20Engine-C%2B%2B%2017-00599C.svg)](https://gcc.gnu.org/)
[![C](https://img.shields.io/badge/Conflict%20Engine-C%2011-darkblue.svg)](https://gcc.gnu.org/)
[![HTML & CSS](https://img.shields.io/badge/UI-HTML5%20%2B%20Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TS-61dafb.svg)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/Offline-PWA%20%2B%20IndexedDB-15803d.svg)](https://developer.mozilla.org/)
[![Bilingual](https://img.shields.io/badge/Language-Marathi%20%7C%20English-amber.svg)](#bilingual-support)

---

## 1. Project Overview

**GramVikas (ग्रामविकास)** is a complete, responsive, mobile-first web application designed specifically to empower rural entrepreneurs across Maharashtra (Kirana merchants, agro-service centers, dairy/poultry operators, fertilizer shops, handicraft sellers, and rural service providers) and their rural customers.

Rural businesses and customers in Maharashtra routinely face three major infrastructural challenges:
1. **Unreliable internet connectivity**: Frequent mobile signal drops and slow 2G/3G speeds during monsoon or peak hours.
2. **Frequent power outages (Load Shedding)**: Interruptions that halt cloud-dependent POS billing and banking apps.
3. **Limited device resources**: Low-cost smartphones with limited RAM, CPU, and storage.

GramVikas solves these challenges with a unified **Polyglot Offline-First Architecture**:
- All operations (billing, products, customer udhari, inventory, expenses, reports) work **100% offline** using **IndexedDB (Dexie.js)**.
- **Dual Dashboards**:
  - **Shopkeeper Dashboard (`/dashboard`)**: Sales, expenses, profit estimates, low-stock inventory, pending udhari, sync status, and POS terminal.
  - **Customer Dashboard (`/customer-portal`)**: Digital Khata passbook, itemized bills, instant UPI QR payment simulation, live store product catalog & stock availability check, pre-order cart, and SMS notices.
- Built using **Python**, **Java**, **C++**, **C**, **HTML5**, and **CSS3 (Tailwind CSS)**.

---

## 2. Polyglot Technology Stack Breakdown

| Technology | Layer / File | Specific Purpose in GramVikas |
|---|---|---|
| **Java 17** | `server-java/src/main/java/com/gramvikas/` | High-throughput REST API backend on port 5000: User authentication with salted SHA-256 password hashing, multithreaded offline sync reconciliation, customer profile API, audit logs, and admin metrics. |
| **Python 3.14** | `server-python/gramvikas_service.py` | Agro-BI microservice on port 5001: Maharashtra agricultural seasonality forecaster (Kharif, Rabi, Summer), MSG91/Twilio SMS dispatcher, digital thermal receipt and customer Khata statement generator, and customer pre-order validation. |
| **C++ 17** | `engine-cpp/GramVikasBI.cpp` | High-performance Native Business Intelligence engine (`GramVikasBI.exe`): Computes 7-day sales velocity, Economic Order Quantity (EOQ), Safety Stock, and Reorder Point (ROP) without external cloud AI. |
| **C 11** | `native-c/SyncConflictResolver.c` | Low-latency deterministic conflict resolution engine (`SyncConflictResolver.exe`): Computes 32-bit FNV-1a state fingerprints and performs 3-way synchronization merging between offline client edits and the server. |
| **HTML5 & CSS3** | `client/index.html`, Tailwind CSS | Semantic, accessible mobile-first responsive web design with warm cream backgrounds (`#FAF8F5`) and forest-green accents (`#1E5128`), PWA manifest, and custom Low-Resource Mode styles. |
| **TypeScript & React 18** | `client/src/` | Type-safe Progressive Web App with Dexie.js (IndexedDB), Service Worker offline caching, Lucide React icons, and Recharts analytics. |

---

## 3. Architecture & Offline-First Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                    Client Device (Smartphone / PC)                     │
│                                                                        │
│   ┌──────────────────────────────┐    ┌─────────────────────────────┐  │
│   │    Shopkeeper Dashboard      │    │     Customer Portal         │  │
│   │  (/dashboard, /sales, /sync) │    │  (/customer-portal, Khata)  │  │
│   └──────────────┬───────────────┘    └──────────────┬──────────────┘  │
│                  │                                   │                 │
│                  └─────────────────┬─────────────────┘                 │
│                                    ▼                                   │
│                        [Bilingual Engine (MR / EN)]                    │
│                                    │                                   │
│                                    ▼                                   │
│                     [Dexie.js / Local IndexedDB]                       │
│    ├── products        ├── customers (Khata)  ├── smsQueue             │
│    ├── sales           ├── payments           ├── syncEvents           │
│    └── expenses        ├── inventoryLogs                               │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 (Online Detection & Proactive Sync Probe)
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend Services & Engines                      │
│                                                                        │
│  [Java 17 Server - :5000]          [Python 3.14 Microservice - :5001]  │
│  ├── /api/auth/login & register    ├── /api/python/forecast (Agro-BI)  │
│  ├── /api/sync (Idempotent Sync)   ├── /api/python/sms/dispatch        │
│  ├── /api/schemes (Govt Schemes)   ├── /api/python/receipt/format      │
│  └── /api/admin/metrics            └── /api/python/customer/preorder   │
│                 │                                    │                 │
│                 ▼                                    ▼                 │
│  [Native C Sync Conflict Engine]   [Native C++ BI Forecasting Engine]  │
│  └── native-c/SyncConflictResolver └── engine-cpp/GramVikasBI          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Functional Modules

### A. Shopkeeper Dashboard (`/dashboard`)
- **Key Business Metrics**: Today's sales, today's expenses, estimated profit, total products, low-stock alerts, pending customer udhari, and unsynced changes count.
- **Offline Business Intelligence**: Best-selling items, revenue trends with Recharts, and reorder suggestions calculated from local transaction history.
- **Connectivity Indicator**: Real-time Online / Offline badge, sync pending counter, and 1-click "Sync Now" button.

### B. Customer Dashboard & Khata Portal (`/customer-portal`)
- **Profile & Khata Summary**: Total outstanding balance (उधारी), credit status, next payment due date, and payment history.
- **Digital Passbook & Invoices**: Itemized digital receipts for all past purchases with item names, quantities, unit prices, discounts, and print/download options.
- **Instant UPI QR Payment**: Interactive Scan & Pay modal with live UPI QR code (`upi://pay?pa=gramvikas.patil@upi&am=...`) and "Confirm Payment" button that records offline payments in IndexedDB and recalculates balances instantly.
- **Live Store Catalog & Stock Check**: Browse shopkeeper's grocery, seeds, fertilizers, and cattle feed items with real-time stock availability badges (*In Stock / Low Stock / Out of Stock*) so rural customers know before traveling to town.
- **Pre-Order Placement**: Add items to a pre-order cart with pickup notes (e.g. *"Will collect tomorrow morning while returning from field"*), submit order, and receive an instant order confirmation token.
- **Received SMS Log**: Review payment reminders, receipts, and government agricultural scheme notifications sent to the customer's phone number.

### C. Products & Inventory Management (`/products`)
- Add, edit, and delete products with SKU, categories, cost price, selling price, current stock, and minimum alert thresholds.
- Automatic low-stock alert triggers in IndexedDB without duplicate spam.

### D. Sales POS & Expenses (`/sales`, `/expenses`)
- Quick-billing POS terminal with customer lookup, automatic totals, cash/UPI/credit (उधारी) splits, and printable receipt.
- Categorized expense tracking (diesel, electricity, transport, wholesale stock, wages) with date filtering.

### E. Smart SMS Notification Centre (`/sms`)
- Notification categories: Low-Stock Alerts, Customer Payment Reminders, Order Billing Updates, and Govt Scheme Announcements.
- Multi-tier delivery:
  1. Primary: MSG91 / Twilio REST Gateway via Java & Python backend.
  2. Offline: Local IndexedDB SMS queue (`offline_queued`) processed when internet returns.
  3. Mobile Fallback: Direct `sms:` URI deep link to launch device's native messaging app with pre-filled Marathi/English message text.

### F. Synchronization Centre (`/sync`)
- Idempotent batch sync engine reconciling local IndexedDB records with the Java backend server.
- Deterministic conflict detection powered by the Native C FNV-1a checksum engine.

---

## 5. Quick Start & Execution Instructions

### Prerequisites
- Node.js (v18+)
- Java JDK (v17+)
- GCC / G++ (v11+)
- Python (v3.10+)

*(All compilers and runtimes are pre-installed and configured in this environment).*

---

### Option A: One-Click Build & Run (Windows Batch)

1. **Compile All Polyglot Modules**:
```cmd
build_all.bat
```
*Compiles Java 17 backend, Native C++ engine, Native C resolver, verifies Python microservice, and builds the React PWA.*

2. **Launch All Services**:
```cmd
run_all.bat
```
*Starts Java backend on port 5000, Python microservice on port 5001, and Vite React PWA on port 5173.*

---

### Option B: Manual Step-by-Step Commands

1. **Compile & Run Java 17 Backend**:
```powershell
$env:PATH = "$env:USERPROFILE\jdk17\bin;" + $env:PATH
javac -encoding UTF-8 -d server-java/build server-java/src/main/java/com/gramvikas/*.java
jar -cfe server-java/gramvikas-server.jar com.gramvikas.GramVikasServer -C server-java/build .
java -jar server-java/gramvikas-server.jar 5000
```
*Backend active at `http://localhost:5000/api/health`.*

2. **Run Python Agro-BI & SMS Microservice**:
```powershell
python server-python/gramvikas_service.py 5001
```
*Microservice active at `http://localhost:5001/api/python/health`.*

3. **Compile Native C and C++ Engines**:
```powershell
$env:PATH = "$env:USERPROFILE\w64devkit\bin;" + $env:PATH
g++ -O2 -std=c++17 -o engine-cpp/GramVikasBI.exe engine-cpp/GramVikasBI.cpp
gcc -O2 -o native-c/SyncConflictResolver.exe native-c/SyncConflictResolver.c
.\engine-cpp\GramVikasBI.exe
.\native-c\SyncConflictResolver.exe
```

4. **Run React Client PWA**:
```powershell
$env:PATH = "$env:USERPROFILE\nodejs;" + $env:PATH
cd client
npm run dev -- --host 0.0.0.0 --port 5173
```
*Web application active at `http://localhost:5173/`.*

---

## 6. How to Test Offline Capabilities (Test Scenarios)

1. **Open Application**: Navigate to `http://localhost:5173/` in your browser.
2. **Switch Roles**:
   - Click **"दुकानदार डॅशबोर्ड (Shopkeeper Dashboard)"** to view business sales, expenses, and inventory.
   - Click **"ग्राहक पोर्टल (Customer Portal)"** in the top bar to inspect customer passbooks, itemized bills, and check live stock!
3. **Simulate Offline Mode**:
   - Open Chrome DevTools (`F12`) -> **Network** tab -> select **"Offline"** (or turn off Wi-Fi).
   - Observe header indicator update immediately to **"Offline Mode (इंटरनेट बंद)"**.
4. **Make an Offline Sale**:
   - Go to **Sales & Billing (`/sales`)**.
   - Add items (e.g. *Wada Kolam Rice* or *Sunflower Oil*) and select *Credit (उधारी)* for customer *Dnyaneshwar Shinde*.
   - Complete sale. Notice the transaction is instantly saved to local IndexedDB, product stock decrements, and customer udhari balance increases offline.
5. **Page Refresh Test**:
   - Press `Ctrl + R` (Refresh) while still completely offline.
   - The application loads instantly from the **Service Worker Cache** and all business records remain intact in IndexedDB!
6. **Customer UPI Payment Test**:
   - Go to **Customer Portal (`/customer-portal`)**.
   - Click **"Pay via UPI QR"**, scan or click **"Confirm Paid"**.
   - Notice the customer's balance updates instantly in IndexedDB and an SMS confirmation is queued.
7. **Reconnect & Sync**:
   - Switch DevTools back to **"Online"**.
   - Click **"Sync Now"** in the header or visit **Sync Centre (`/sync`)**.
   - All offline records are uploaded to the Java backend with zero duplicates.

---

## 7. Security & Rural Practicality Design

- **Zero API Secrets in Frontend**: SMS API credentials and database passwords reside securely in backend configuration.
- **Low-Resource Mode**: Reduces heavy CSS blurs, disables animations, and lowers chart fidelity to conserve battery and memory on budget phones.
- **Transparent Conflict Resolution**: Financial records are never overwritten silently; multi-device conflicts present a side-by-side comparison modal.
- **Honest SMS Delivery Status**: Distinguishes between gateway delivery and native device SMS fallback.

---

*Developed for the Rural Entrepreneurs and Citizens of Maharashtra.*
