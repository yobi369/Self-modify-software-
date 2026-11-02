# Release and versioning process

## Versioning

Use semantic versioning once public compatibility guarantees are defined:

- MAJOR: incompatible API or product behaviour.
- MINOR: backward-compatible functionality.
- PATCH: backward-compatible fixes and security updates.

Do not create a release tag until the release candidate has passed the production gates.

## Release checklist

1. Confirm all intended changes are merged to the protected release branch.
2. Review the changelog and migration notes.
3. Confirm CI passed for the exact release commit.
4. Confirm dependency and secret scans passed.
5. Verify preview deployment and smoke-test results.
6. Obtain required human product/security approval.
7. Create an annotated version tag and release notes.
8. Deploy the exact tagged commit.
9. Run production smoke checks and monitor error/latency signals.
10. Retain the previous deployment for rollback.

## Release evidence

Record version, commit SHA, build ID, dependency lockfile digest, test workflow URL, security scan status, reviewer, deployment ID, and rollback target. A release is not reproducible if these identifiers are missing.
