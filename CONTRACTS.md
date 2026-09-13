# Contracts

`data/sample.json` supplies three option arrays (`roles`, `locations`, `experienceLevels`), curated `estimates`, and role, location, and experience baseline tables. Each curated estimate has `role`, `location`, `experience`, `minimum`, `median`, `maximum`, `confidence`, `sampleSize`, and three `listings`. Any uncurated selection uses the baseline tables to derive a consistent seed-data estimate and three illustrative listings.

The app reads and writes `graduate-salary-tracker-recent-searches` in browser localStorage. It stores up to five unique searches, each with role, location, experience, and median.
