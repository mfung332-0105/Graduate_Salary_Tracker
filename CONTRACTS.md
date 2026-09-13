# Contracts

`data/sample.json` supplies three option arrays (`roles`, `locations`, `experienceLevels`), role/location/experience baseline tables, and ten role-specific curated listing examples for every role. Each normalized listing has `title`, `company`, `location`, `experience`, `minimum`, `maximum`, and `source`. The templates are realistic curated sample data, not live vacancies.

`estimateFor` also returns `sampleSize`, `confidence`, and `confidenceReason`. Confidence is High at 10+ comparable examples, Medium at 5–9, and Low below 5.

The app reads and writes `graduate-salary-tracker-recent-searches` in browser localStorage. It stores up to five unique searches, each with role, location, experience, and median.

`source.js` is the only place application data enters or is normalized. Its `estimateFor` method returns the display-ready estimate and listing shape consumed by the UI. A future API implementation can replace `load` and/or `estimateFor` while preserving that shape and leaving the UI unchanged.
