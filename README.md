# Graduate Salary Tracker — Phase 2

A desktop-first salary estimator for fresh graduates and early-career job seekers. It uses local seed data to show an estimated salary range, confidence, comparable listings, and five locally stored recent searches. Phase 2 also presents clearly attributed live USAJobs federal openings when configured.

## Run locally

From this folder, serve the files with any static web server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. A server is required because the app fetches its JSON seed data.

## Deployment

Deploy the project root to Vercel. No build command is required. To enable live USAJobs results, add these encrypted Vercel environment variables for Production, Preview, and Development:

- `USAJOBS_API_KEY`: the API key issued by USAJobs.
- `USAJOBS_USER_AGENT`: the email address registered with that USAJobs key.

The browser calls the internal `/api/usajobs` serverless function, so credentials never reach the browser or GitHub. Until both values are present, the page shows a setup message instead of live listings.

## Scope

This implementation intentionally includes no accounts, authentication, database, scraping, AI features, or third-party libraries. See `CONTRACTS.md` and `CHECKS.md` for data and verification details.
