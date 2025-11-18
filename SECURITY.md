# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x-alpha   | ✅ |
| < 1.0   | ❌                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Open a Public Issue

Security vulnerabilities should not be publicly disclosed until we've had a chance to address them.

### 2. Email Us

Send details to: **security@goldensheepai.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### 3. Response Timeline

- **24 hours:** Initial acknowledgment
- **72 hours:** Assessment and severity rating
- **7 days:** Patch development (for critical issues)
- **14 days:** Public disclosure (after fix is deployed)

### 4. Responsible Disclosure

We follow coordinated vulnerability disclosure:

1. You report the issue privately
2. We work on a fix
3. We deploy the fix
4. We credit you in the release notes (if desired)
5. We publicly disclose the issue

## Security Best Practices

### For Users

- **Keep updated:** Always use the latest version
- **Review dependencies:** Check `pnpm audit` regularly
- **Secure your environment:** Use `.env` files, never commit secrets
- **Validate inputs:** Don't trust user data in actions

### For Contributors

- **No secrets in code:** Use environment variables
- **Validate all inputs:** Use type system + verification
- **Sanitize outputs:** Prevent injection attacks
- **Test security:** Include security test cases

## Known Security Considerations

### ShepLang Verification

ShepLang's verification engine provides defense-in-depth:

- ✅ **Type safety** prevents type confusion attacks
- ✅ **Null safety** prevents null pointer vulnerabilities
- ✅ **API validation** prevents endpoint injection
- ✅ **Exhaustiveness** prevents unhandled edge cases

### ShepThon Backend

- All database queries are parameterized (no SQL injection)
- Input validation at the type system level
- No dynamic code execution

## Hall of Fame

Contributors who responsibly disclose security issues:

*(None yet - be the first!)*

---

**Thank you for helping keep ShepLang secure!** 🔒
