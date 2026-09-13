# Graduate Salary Tracker — Phase 2

A desktop-first salary estimator for fresh graduates and early-career job seekers. It uses curated local data to show an estimated salary range, confidence, detailed comparable listings, five locally stored recent searches, and Phase 3 comparison and sharing tools.

## Run locally

From this folder, serve the files with any static web server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. A server is required because the app fetches its JSON seed data.

## Deployment

Deploy the project root to Vercel. No build command, API key, or environment variable is required. The salary estimator remains fully local; the optional live-openings panel uses a Vercel serverless function to read selected public employer boards.

## Scope

## Phase 2 data approach

Phase 2 uses expanded curated sample data because the USAJobs integration was postponed. Every role now has ten role-specific comparable examples. Each result includes an example employer, the selected location and experience level, an illustrative salary range, and a source placeholder. Confidence is calculated from the comparable-example count: High for 10+, Medium for 5–9, and Low for fewer than 5. `source.js` is the sole application boundary for data loading and normalization, so a future API can replace the local source without changing the UI.

This implementation intentionally includes no accounts, authentication, database, scraping, AI features, or third-party libraries. The optional live-openings panel uses only documented public employer job-board endpoints; no API keys are required. See `CONTRACTS.md` and `CHECKS.md` for data and verification details.

## Phase 3 features

Compare any two locally saved searches to view their selections, salary ranges, and median difference side by side. Use **Share estimate** to create a URL containing the selected role, location, and experience level. Opening that URL recreates the same locally calculated estimate without an account or external service.

Each curated comparable listing includes a **Search similar roles** link. It opens a Google search for the listing title and selected location; it is not an application link or a claim that the example vacancy is live.

## Salary Showdown

At the bottom of the page, **Salary Showdown** presents two random role, location, and experience combinations. Choose the one with the higher calculated median salary to reveal both medians. Each game is capped at 20 rounds, then locks and displays correct answers, rounds played, and accuracy percentage; it uses the same local salary model as the main estimator and does not store or share game activity.

## Illustrative charts

Beneath each salary range, the tracker includes two modeled bar charts: **Salary by location** and **Salary progression**. They are calculated from the same curated local model as the estimate, are clearly marked illustrative, and demonstrate how richer verified data could be visualized later.

## Live employer openings

The app also shows a separate live-openings panel after an estimate. It reads selected public employer job boards from Figma (Greenhouse) and Swiftly (Lever), matches their published titles to the selected role and state, and links directly to the official posting. Multi-location postings identify the location matching the user’s selection and list any other eligible locations separately. Use **Include U.S. remote roles** to add explicitly remote U.S. openings; otherwise, the panel does not substitute jobs from another state. These live jobs are not used to calculate salary estimates. No credentials are required; if a board is unavailable, the panel explains that rather than changing the estimate.
