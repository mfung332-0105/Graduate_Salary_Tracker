# Phase 1 checks

- Open the site from a local static server.
- Select Software Engineer, California, and New Graduate, then choose **Estimate salary**. Confirm the range, confidence, listings, and disclaimer appear.
- Repeat for Data Analyst / New York / New Graduate and Marketing Coordinator / Texas / Early Career.
- Make six distinct searches and confirm local history retains only five.
- Reload the page and confirm recent searches persist. Use **Clear history** and confirm it empties.
- Choose any otherwise untested role, location, and experience combination and confirm a seed-data estimate and three illustrative listings appear.
- Confirm each estimate displays ten detailed comparable listings with title, employer, selected location, selected experience level, illustrative salary range, and source placeholder.
- Confirm confidence is High with ten examples, and that its explanation explicitly cites the example count and threshold. Temporarily reduce a role's examples to 5–9 and fewer than 5 to verify Medium and Low behavior.
- Confirm the site works with network access disabled after its local JSON has loaded; no API key, environment variable, external service, or external request is required.
- Confirm `source.js` remains the only application module loading or normalizing data, so a future API can keep the same UI contract.
