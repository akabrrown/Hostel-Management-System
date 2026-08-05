# Security Configuration Guide - UPSA Hostel Management System

## Overview
This document outlines the comprehensive security measures implemented in the UPSA Hostel Management System to protect against common web vulnerabilities and ensure data privacy.

## Security Features Implemented

### 1. Runtime Schema Validation (Zod)
- **Location**: `src/lib/schemas.ts`
- **Purpose**: Strict validation of all input data at runtime
- **Coverage**: 
  - Environment variables
  - User authentication data
  - API request payloads
  - File uploads
  - Search parameters

### 2. Input Sanitization & Output Encoding
- **Location**: `src/lib/security.ts`
- **Purpose**: Prevent XSS attacks and injection vulnerabilities
- **Implementation**:
  - DOMPurify for HTML content sanitization
  - Custom output encoding for user-generated content
  - Recursive object sanitization

### 3. Rate Limiting (Upstash Redis)
- **Location**: `src/lib/security.ts`
- **Purpose**: Prevent brute force attacks and API abuse
- **Configuration**:
  - Authentication: 5 attempts per 15 minutes
  - General API: 100 requests per 15 minutes
  - File uploads: 10 uploads per hour
  - Search: 50 searches per 15 minutes

### 4. CORS Configuration
- **Location**: `src/middleware.ts`, `src/lib/security.ts`
- **Purpose**: Control cross-origin requests
- **Settings**:
  - Strict origin validation
  - Allowed methods: GET, POST, PUT, DELETE, OPTIONS
  - Credential support for authenticated requests

### 5. Secure Password Management
- **Location**: `src/lib/auth.ts`
- **Features**:
  - bcrypt with 12 salt rounds
  - Password strength validation
  - Secure password reset flow
  - Session-based authentication

### 6. Session Management
- **Location**: `src/lib/security.ts`, `src/lib/auth.ts`
- **Features**:
  - Secure HTTP-only cookies
  - Session expiration (24 hours)
  - Activity tracking
  - Secure session destruction

### 7. CSRF Protection
- **Location**: `src/lib/security.ts`
- **Features**:
  - CSRF token generation and validation
  - Token storage in Redis
  - Required for state-changing operations

### 8. Security Headers
- **Location**: `src/middleware.ts`, `src/lib/security.ts`
- **Headers Implemented**:
  - Content Security Policy (CSP)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy
  - Strict-Transport-Security (HSTS)

### 9. IP-based Security
- **Location**: `src/lib/security.ts`
- **Features**:
  - IP blocking for malicious actors
  - Bot detection and blocking
  - IP-based rate limiting
  - Geolocation filtering (if needed)

### 10. Audit Logging
- **Location**: `src/lib/security.ts`
- **Features**:
  - Comprehensive audit trail
  - 30-day log retention
  - Failed authentication tracking
  - Administrative action logging

### 11. Bot Protection
- **Location**: `src/lib/security.ts`
- **Features**:
  - User-Agent pattern detection
  - Sensitive route protection
  - Cloudflare Turnstile integration (configurable)

### 12. SQL Injection Prevention
- **Location**: ORM usage throughout the application
- **Features**:
  - Parameterized queries
  - ORM-based database access
  - Input validation before database operations

## Environment Variables Security

### Required Security Variables
```bash
# Authentication
NEXTAUTH_SECRET=your-256-bit-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# CSRF Protection
CLOUDFLARE_TURNSTILE_SECRET=your-turnstile-secret

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

## Security Best Practices

### 1. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)
- No common patterns

### 2. Session Security
- HTTP-only cookies
- Secure flag in production
- SameSite=strict
- 24-hour expiration
- Activity-based refresh

### 3. API Security
- Request validation for all endpoints
- Rate limiting by IP and endpoint type
- CSRF protection for state changes
- Input sanitization and validation

### 4. Data Protection
- Encrypted data transmission (HTTPS)
- Sensitive data hashing
- Audit logging for all actions
- Regular security updates

## Security Monitoring

### 1. Audit Logs
- Location: Redis storage
- Retention: 30 days
- Content: User actions, IP addresses, timestamps
- Access: Admin dashboard integration

### 2. Rate Limiting Monitoring
- Real-time rate limit status
- Blocked IP tracking
- Automated alerting for suspicious activity

### 3. Failed Authentication Tracking
- Multiple failed attempts trigger IP blocking
- Geographic anomaly detection
- Pattern analysis for brute force attacks

## Deployment Security

### 1. Production Configuration
- HTTPS enforcement
- Security headers enabled
- Rate limiting active
- Audit logging enabled
- Bot protection active

### 2. Environment Separation
- Different secrets per environment
- Staging environment for testing
- Production-only security features

### 3. Dependency Security
- Regular vulnerability scanning
- Automated security updates
- Dependency audit reports

## Testing Security

### 1. Security Test Coverage
- Input validation testing
- Authentication flow testing
- Rate limiting verification
- CSRF protection testing
- Security header validation

### 2. Penetration Testing
- OWASP Top 10 vulnerability testing
- API endpoint security testing
- Authentication bypass testing
- Data exposure testing

## Compliance

### 1. Data Protection
- GDPR compliance considerations
- Data minimization principles
- Right to be forgotten implementation
- Data retention policies

### 2. Educational Institution Requirements
- Student data protection
- FERPA compliance (if applicable)
- Access control requirements
- Audit trail maintenance

## Security Incident Response

### 1. Detection
- Automated monitoring alerts
- Anomaly detection
- Failed authentication spikes
- Unusual access patterns

### 2. Response Procedures
- Immediate account lockdown
- IP blocking of malicious actors
- Password resets for affected accounts
- Security audit initiation

### 3. Post-Incident
- Root cause analysis
- Security improvements
- Documentation updates
- Staff training

## Future Enhancements

### 1. Advanced Authentication
- Two-factor authentication (2FA)
- Biometric authentication options
- Single Sign-On (SSO) integration
- Adaptive authentication

### 2. Advanced Threat Detection
- Machine learning anomaly detection
- Behavioral analysis
- Real-time threat intelligence
- Automated response systems

### 3. Compliance Frameworks
- ISO 27001 alignment
- SOC 2 compliance
- NIST Cybersecurity Framework
- Industry-specific compliance

## Security Checklist

### Pre-Deployment
- [ ] All environment variables set and secure
- [ ] Rate limiting configured and tested
- [ ] Security headers verified
- [ ] CSRF protection enabled
- [ ] Audit logging functional
- [ ] HTTPS properly configured
- [ ] Password policies enforced
- [ ] Bot protection active

### Ongoing Maintenance
- [ ] Regular dependency updates
- [ ] Security patch monitoring
- [ ] Audit log review
- [ ] Rate limit adjustment
- [ ] Security testing
- [ ] Compliance verification
- [ ] Incident response testing
- [ ] Staff security training

## Contact and Support

For security-related issues or concerns:
- Security Team: security@upsa.edu.gh
- Incident Response: security@upsa.edu.gh
- Documentation: Available in project repository

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/api-reference/next.config.js/security)
- [Zod Validation](https://github.com/colinhacks/zod)
- [Upstash Redis](https://upstash.com/)
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
