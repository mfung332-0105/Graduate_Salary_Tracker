# Phase 1 checks

- Open the site from a local static server.
- Select Software Engineer, California, and New Graduate, then choose **Estimate salary**. Confirm the range, confidence, listings, and disclaimer appear.
- Repeat for Data Analyst / New York / New Graduate and Marketing Coordinator / Texas / Early Career.
- Make six distinct searches and confirm local history retains only five.
- Reload the page and confirm recent searches persist. Use **Clear history** and confirm it empties.
- Choose any otherwise untested role, location, and experience combination and confirm a seed-data estimate and three illustrative listings appear.
- With no USAJobs Vercel variables configured, confirm a useful live-listings setup message is shown after estimating.
- With valid `USAJOBS_API_KEY` and `USAJOBS_USER_AGENT` Vercel variables, confirm live openings, salaries, official close dates, and USAJobs links appear. Confirm the API key is absent from the browser source and Git history.
