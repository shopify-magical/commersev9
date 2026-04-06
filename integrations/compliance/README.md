# Compliance Documentation

## SOC 2 Type II Certification

### Trust Service Criteria

**Security (Common Criteria)**
- Access controls with multi-tenant isolation
- Encryption in transit (TLS 1.3) and at rest (AES-256)
- Role-based access control (RBAC)
- Audit logging for all API calls

**Availability**
- 99.9% uptime SLA for Professional plans
- 99.99% uptime SLA for Enterprise plans
- Automatic failover and redundancy
- Health monitoring with alerts

**Processing Integrity**
- Goal processing validation
- Accurate metrics and reporting
- Data integrity checks

**Confidentiality**
- Tenant data isolation
- Data retention policies
- Secure deletion procedures

**Privacy**
- Data minimization principles
- Consent management
- Privacy by design

### Controls

| Control ID | Description | Implementation |
|------------|-------------|----------------|
| AC-1 | Access Control | API keys, JWT tokens, IP allowlisting |
| AC-2 | Authentication | OAuth 2.0, multi-factor support |
| CC6.1 | Logical Access | RBAC, principle of least privilege |
| CC6.7 | Encryption | TLS 1.3, AES-256, key rotation |
| A1.1 | Availability | Auto-scaling, load balancing |
| PI1.1 | Processing | Validation, error handling |

---

## GDPR Compliance

### Data Processing

**Personal Data We Process:**
- Tenant identifiers (company name, ID)
- Contact information (email, name)
- Usage data (API calls, goals)
- Technical data (IP, logs)

**Legal Basis:**
- Contract performance (for service delivery)
- Legitimate interest (security, improvements)
- Consent (marketing, optional features)

### Rights Implementation

| Right | Endpoint | Description |
|-------|----------|-------------|
| Access | GET /v1/tenants/me | Retrieve personal data |
| Rectification | PUT /v1/tenants/me | Update personal data |
| Erasure | DELETE /v1/tenants | Delete account and data |
| Portability | GET /v1/export | Export data in JSON |
| Objection | POST /v1/opt-out | Opt out of processing |

### Data Retention

- Active tenants: Data retained while active
- Inactive tenants: 30-day grace period, then anonymized
- Logs: 90 days (configurable)
- Backups: 30 days with secure deletion

---

## HIPAA Compliance (Enterprise)

### PHI Handling

**Protected Health Information (PHI) Categories:**
- None by default in standard service
- Enterprise customers can configure PHI storage
- Encryption at rest and in transit required

### Technical Safeguards

| Requirement | Implementation |
|-------------|----------------|
| Access Control | Unique user IDs, auto-logout, encryption |
| Audit Controls | Logging, audit trails, access logs |
| Integrity Controls | Hash verification, data validation |
| Transmission Security | TLS 1.3, VPN support |

### Business Associate Agreement

Enterprise customers can request BAA via:
- Email: compliance@agenticengine.io
- Portal: Settings > Compliance > Request BAA

---

## Compliance Certifications

### Current Status

| Certification | Status | Valid Until |
|---------------|--------|-------------|
| SOC 2 Type II | In Progress | Q3 2026 |
| GDPR | Compliant | Ongoing |
| HIPAA | Available | On Request |
| ISO 27001 | Planned | Q4 2026 |

### Audit Controls

All systems include:
- Immutable audit logs
- 90-day log retention
- Log export capabilities
- Real-time alerting

### Contact

For compliance questions:
- Email: compliance@agenticengine.io
- Enterprise: security@agenticengine.io