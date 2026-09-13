# Graduate Salary Tracker — Phase 2

A desktop-first salary estimator for fresh graduates and early-career job seekers. It uses curated local data to show an estimated salary range, confidence, detailed comparable listings, and five locally stored recent searches.

## Run locally

From this folder, serve the files with any static web server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. A server is required because the app fetches its JSON seed data.

## Deployment

This is a static site and can be deployed to Vercel with the project root as the deployment directory. No build command, API key, environment variable, or external service is required.

## Scope

## Phase 2 data approach

Phase 2 uses expanded curated sample data because the USAJobs integration was postponed. Every role now has ten role-specific comparable examples. Each result includes an example employer, the selected location and experience level, an illustrative salary range, and a source placeholder. Confidence is calculated from the comparable-example count: High for 10+, Medium for 5–9, and Low for fewer than 5. `source.js` is the sole application boundary for data loading and normalization, so a future API can replace the local source without changing the UI.

This implementation intentionally includes no accounts, authentication, database, API dependency, scraping, AI features, or third-party libraries. See `CONTRACTS.md` and `CHECKS.md` for data and verification details.
