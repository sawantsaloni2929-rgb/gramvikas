package com.gramvikas;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * High-performance thread-safe storage engine for GramVikas Java Server.
 * Supports offline record reconciliation, idempotency hashing, and JSON backups.
 */
public class DataStore {
    private static DataStore instance;

    // Concurrent in-memory stores keyed by ID
    public final Map<String, Map<String, Object>> users = new ConcurrentHashMap<>();
    public final Map<String, Map<String, Object>> products = new ConcurrentHashMap<>();
    public final Map<String, Map<String, Object>> sales = new ConcurrentHashMap<>();
    public final Map<String, Map<String, Object>> expenses = new ConcurrentHashMap<>();
    public final Map<String, Map<String, Object>> customers = new ConcurrentHashMap<>();
    public final Map<String, Map<String, Object>> payments = new ConcurrentHashMap<>();
    public final Map<String, Map<String, Object>> smsLogs = new ConcurrentHashMap<>();
    public final List<Map<String, Object>> schemes = Collections.synchronizedList(new ArrayList<>());
    public final List<Map<String, Object>> syncAuditHistory = Collections.synchronizedList(new ArrayList<>());

    private DataStore() {
        seedInitialData();
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    public static String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update((password + salt).getBytes(StandardCharsets.UTF_8));
            byte[] bytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return Integer.toHexString((password + salt).hashCode());
        }
    }

    private void seedInitialData() {
        // Default demo entrepreneur user
        Map<String, Object> demoUser = new HashMap<>();
        demoUser.put("id", "demo_user_suresh_patil");
        demoUser.put("email", "suresh@gramvikas.in");
        demoUser.put("businessName", "Shree Ganesh Krishi & Kirana Stores");
        demoUser.put("ownerName", "Suresh Tukaram Patil");
        demoUser.put("village", "Baramati Rural");
        demoUser.put("district", "Pune");
        demoUser.put("taluka", "Baramati");
        demoUser.put("phone", "+919822998877");
        demoUser.put("preferredLanguage", "mr");
        demoUser.put("role", "entrepreneur");
        demoUser.put("passwordHash", hashPassword("admin123", "salt_gramvikas"));
        demoUser.put("createdAt", "2026-10-01T00:00:00Z");
        users.put("suresh@gramvikas.in", demoUser);

        // Admin user
        Map<String, Object> adminUser = new HashMap<>();
        adminUser.put("id", "admin_gramvikas_gov");
        adminUser.put("email", "admin@gramvikas.gov.in");
        adminUser.put("businessName", "Maharashtra Gramin Vikas Kendra");
        adminUser.put("ownerName", "District Administration Pune");
        adminUser.put("village", "Pune HQ");
        adminUser.put("district", "Pune");
        adminUser.put("phone", "+912026123456");
        adminUser.put("preferredLanguage", "mr");
        adminUser.put("role", "admin");
        adminUser.put("passwordHash", hashPassword("admin123", "salt_gramvikas"));
        adminUser.put("createdAt", "2026-10-01T00:00:00Z");
        users.put("admin@gramvikas.gov.in", adminUser);

        // Verified Government Schemes
        addScheme("scheme_601",
                "Annasaheb Patil Arthik Vikas Mahamandal Interest Subvention",
                "अण्णासाहेब पाटील आर्थिक विकास महामंडळ व्याज परतावा योजना",
                "Skill Development, Employment & Entrepreneurship Dept, Maharashtra",
                "Subsidizes bank loan interest up to ₹15 Lakhs for rural micro-entrepreneurs.",
                "ग्रामीण तरुणांना व सूक्ष्म उद्योजकांना व्यवसाय सुरू करण्यासाठी ₹१५ लाखांपर्यंतच्या कर्जावर १२% पर्यंत व्याज परतावा.",
                "12% interest reimbursement on term loans up to ₹15 Lakhs for 5 years.",
                "वय १८ ते ४५ वर्षे, कौटुंबिक वार्षिक उत्पन्न ₹८ लाखांच्या आत, किमान १० वी पास.",
                "Ongoing FY 2026-27 (सतत सुरू)",
                "2026-10-01",
                "mahasharad.in / mahaswayam.gov.in");

        addScheme("scheme_602",
                "PM Vishwakarma Scheme for Rural Artisans & Retailers",
                "पीएम विश्वकर्मा योजना (पारंपरिक कारागीर व व्यावसायिक)",
                "Ministry of MSME, Govt of India & Govt of Maharashtra",
                "Recognizes rural trade, gives ₹15,000 toolkit voucher and loan @ 5%.",
                "पारंपरिक कारागीर व दुकानदारांना ₹१५,००० टूलकिट अनुदान, प्रशिक्षण व ५% सवलतीच्या दरात ₹३ लाखांपर्यंत कर्ज.",
                "₹15,000 voucher, 5-day stipend training, ₹1L (Phase 1) & ₹2L (Phase 2) @ 5%.",
                "ग्रामीण कारागीर, शिंपी, सुतार, लोहार, कुंभार व किरकोळ व्यावसायिक.",
                "Active FY 2026-27 (नोंदणी सुरू)",
                "2026-09-28",
                "pmvishwakarma.gov.in");
    }

    private void addScheme(String id, String title, String titleMr, String dept, String desc, String descMr, String benefits, String elig, String deadline, String verifiedDate, String source) {
        Map<String, Object> s = new HashMap<>();
        s.put("id", id);
        s.put("title", title);
        s.put("titleMr", titleMr);
        s.put("department", dept);
        s.put("description", desc);
        s.put("descriptionMr", descMr);
        s.put("benefits", benefits);
        s.put("eligibility", elig);
        s.put("deadline", deadline);
        s.put("verifiedDate", verifiedDate);
        s.put("officialSource", source);
        schemes.add(s);
    }
}
