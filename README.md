# Graduate Salary Tracker — Phase 1

A desktop-first salary estimator for fresh graduates and early-career job seekers. It uses local seed data to show an estimated salary range, confidence, comparable listings, and five locally stored recent searches.

## Run locally

From this folder, serve the files with any static web server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. A server is required because the app fetches its JSON seed data.

## Deployment

This is a static site and can be deployed to Vercel with the project root as the deployment directory. No build command or environment variables are required.

## Scope

This implementation intentionally includes no accounts, authentication, database, APIs, scraping, AI features, or third-party libraries. See `CONTRACTS.md` and `CHECKS.md` for data and verification details.
