# Deployment guide

## Current deployment model

The repository includes Vercel configuration for a Vite static frontend and a serverless Express API in `api/index.ts`. Local development uses `server.ts`; it is not the production entry point.

## Required environment configuration

Configure `GEMINI_API_KEY` as an encrypted server-side environment variable for the intended deployment environments. Do not prefix it with `VITE_`. Keep preview and production credentials separate where possible. Rotate any credential that has ever been committed or exposed.

## Preview deployment

1. Push a branch and open a pull request.
2. Wait for CI to pass.
3. Create or inspect the Vercel preview deployment.
4. Confirm the build output and API route behaviour.
5. Run the smoke tests in the release checklist.
6. Verify that provider failures are surfaced safely and no secret appears in client assets or logs.

## Production deployment

Production deployment must be connected to a protected production branch and require successful CI. Use deployment protection and approval controls supported by the hosting plan. Deploy a reviewed commit, not a developer's unreviewed local build.

## Post-deployment smoke checks

- Application root returns HTTP 200.
- Static assets load without console errors.
- Health endpoint returns the expected healthy response.
- Invalid API payload returns a controlled 4xx response.
- Valid AI request succeeds only when a server-side key is configured.
- Provider timeout or quota failure returns a controlled error.
- No secret or submitted source code is leaked in responses or logs.
- Mobile layout and core navigation work.

## Rollback

Keep the previous known-good deployment available. If health checks fail, error rates spike, or a security issue is detected, roll back to the last known-good deployment and disable the affected endpoint or integration until the incident is understood. Record the deployed commit, rollback commit/deployment, timestamps, and customer impact.

## Deployment limitations

A successful Vercel build alone does not validate serverless runtime compatibility, API quotas, abuse resistance, data protection, or customer support readiness. Complete the production gates before selling this as a production service.
