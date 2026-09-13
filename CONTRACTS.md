# Contracts

`data/sample.json` supplies three option arrays (`roles`, `locations`, `experienceLevels`), role/location/experience baseline tables, and three role-specific `listingTemplates` for every role. Each normalized listing has `title`, `company`, `location`, `experience`, `minimum`, `maximum`, and `source`. The templates are realistic curated sample data, not live vacancies.

The app reads and writes `graduate-salary-tracker-recent-searches` in browser localStorage. It stores up to five unique searches, each with role, location, experience, and median.

`source.js` is the only place application data enters or is normalized. Its `estimateFor` method returns the display-ready estimate and listing shape consumed by the UI. A future API implementation can replace `load` and/or `estimateFor` while preserving that shape and leaving the UI unchanged.
