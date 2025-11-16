# Dependency Security Update

**Date:** November 16, 2025  
**Type:** Security Patch  
**Severity:** Medium

## Summary

Added npm package override to enforce `js-yaml` version `^4.1.1` across all dependencies, addressing a known security vulnerability in earlier versions.

## Changes

### package.json
```json
"overrides": {
  "js-yaml": "^4.1.1"
}
```

## Rationale

The `js-yaml` package is a transitive dependency used by several development tools in the project (ESLint, Jest). Earlier versions (< 4.1.0) contain a known security vulnerability:

- **CVE-2021-32764**: Denial of Service vulnerability in js-yaml
- **Severity**: Medium
- **Fixed in**: 4.1.0+

While this vulnerability primarily affects server-side YAML parsing and doesn't directly impact the Symbi mobile app runtime, it's a best practice to ensure all dependencies are patched to prevent potential issues during development and build processes.

## Impact

### Development
- No breaking changes to development workflow
- All existing scripts continue to work
- Build process unaffected

### Production
- No impact on app runtime behavior
- No changes to app bundle size
- No user-facing changes

### Dependencies Affected
The override ensures that all transitive dependencies using `js-yaml` will use version 4.1.1 or higher:
- ESLint configuration parsing
- Jest configuration parsing
- Other development tooling

## Verification

Run the following command to verify the override is applied:

```bash
npm ls js-yaml
```

Expected output should show all instances using version 4.1.1 or higher.

## Related Documentation

- Security Audit Checklist: `docs/security-audit-checklist.md` (updated)
- Setup Guide: `SETUP.md` (updated)
- README: `README.md` (updated)

## Best Practices

This update follows security best practices:

1. **Proactive patching**: Address vulnerabilities even in development dependencies
2. **Version pinning**: Use overrides to ensure consistent versions across the dependency tree
3. **Documentation**: Document security-related changes for audit trails
4. **Regular audits**: Run `npm audit` regularly to identify vulnerabilities

## Next Steps

1. Continue monitoring for security advisories
2. Run `npm audit` before each release
3. Consider implementing automated dependency scanning (Snyk, Dependabot)
4. Review and update dependencies quarterly

## References

- js-yaml GitHub: https://github.com/nodeca/js-yaml
- CVE-2021-32764: https://nvd.nist.gov/vuln/detail/CVE-2021-32764
- npm overrides documentation: https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides
