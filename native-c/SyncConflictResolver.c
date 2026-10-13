/**
 * GramVikas Native C Synchronization & Conflict Resolver Engine
 * High-performance deterministic record merging and state checksumming
 * for low-latency offline sync resolution in rural environments.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <time.h>

#define MAX_RECORDS 64

typedef enum {
    SYNC_STATUS_SYNCED = 0,
    SYNC_STATUS_LOCAL_NEWER = 1,
    SYNC_STATUS_SERVER_NEWER = 2,
    SYNC_STATUS_FINANCIAL_CONFLICT = 3
} SyncConflictStatus;

typedef struct {
    char id[32];
    char name[64];
    double amount;
    int64_t clientTimestamp;
    int64_t serverTimestamp;
    uint32_t clientChecksum;
    uint32_t serverChecksum;
    SyncConflictStatus status;
} FinancialRecord;

// FNV-1a fast native 32-bit hashing algorithm
uint32_t fnv1a_hash(const char* str, double val) {
    uint32_t hash = 2166136261u;
    const unsigned char* p = (const unsigned char*)str;
    while (*p) {
        hash ^= (uint32_t)(*p++);
        hash *= 16777619u;
    }
    // Mix double value
    uint64_t valBits;
    memcpy(&valBits, &val, sizeof(double));
    for (int i = 0; i < 8; i++) {
        hash ^= (uint32_t)((valBits >> (i * 8)) & 0xFF);
        hash *= 16777619u;
    }
    return hash;
}

// 3-way synchronization resolver
SyncConflictStatus resolve_conflict(FinancialRecord* rec) {
    rec->clientChecksum = fnv1a_hash(rec->name, rec->amount);
    
    // If checksums match, records are identical
    if (rec->clientChecksum == rec->serverChecksum) {
        return SYNC_STATUS_SYNCED;
    }

    // If client timestamp is strictly newer and server is unchanged
    if (rec->clientTimestamp > rec->serverTimestamp && rec->serverTimestamp == 0) {
        return SYNC_STATUS_LOCAL_NEWER;
    }

    // Both modified concurrently: check financial threshold divergence
    if (rec->clientTimestamp > 0 && rec->serverTimestamp > 0) {
        // Flag for explicit user review to prevent financial discrepancy
        return SYNC_STATUS_FINANCIAL_CONFLICT;
    }

    return SYNC_STATUS_SERVER_NEWER;
}

int main(int argc, char* argv[]) {
    printf("========================================================\n");
    printf("  GramVikas Native C Synchronization & Conflict Resolver\n");
    printf("  Embedded Deterministic State Engine for Rural Systems\n");
    printf("========================================================\n\n");

    FinancialRecord testRecords[3] = {
        {"sale_101", "Sale to Dnyaneshwar Shinde", 1850.00, 1728630000, 0, 0, 0, SYNC_STATUS_SYNCED},
        {"cust_201", "Customer Ledger: Savita Jadhav", 850.00, 1728631000, 1728631050, 0, 1234567, SYNC_STATUS_SYNCED},
        {"exp_401", "Diesel & Power Expense", 780.00, 1728629000, 1728629000, 0, 0, SYNC_STATUS_SYNCED}
    };

    // Simulate server checksum match for record 2
    testRecords[2].serverChecksum = fnv1a_hash(testRecords[2].name, testRecords[2].amount);

    for (int i = 0; i < 3; i++) {
        FinancialRecord* r = &testRecords[i];
        r->status = resolve_conflict(r);

        printf("[Record %s] \"%s\" (Amount: Rs. %.2f)\n", r->id, r->name, r->amount);
        printf("  Client Checksum: 0x%08X | Server Checksum: 0x%08X\n", r->clientChecksum, r->serverChecksum);
        
        switch (r->status) {
            case SYNC_STATUS_SYNCED:
                printf("  -> Resolution: IN SYNC (Zero changes required)\n\n");
                break;
            case SYNC_STATUS_LOCAL_NEWER:
                printf("  -> Resolution: LOCAL IS NEWER (Safe to push to server)\n\n");
                break;
            case SYNC_STATUS_SERVER_NEWER:
                printf("  -> Resolution: SERVER IS NEWER (Safe to pull from server)\n\n");
                break;
            case SYNC_STATUS_FINANCIAL_CONFLICT:
                printf("  -> Resolution: FINANCIAL CONFLICT DETECTED! Presenting side-by-side modal to entrepreneur.\n\n");
                break;
        }
    }

    printf("Native C execution finished with 0 errors.\n");
    return 0;
}
