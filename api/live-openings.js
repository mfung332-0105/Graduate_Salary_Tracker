const sources = [
  { name: "Figma", platform: "Greenhouse", url: "https://boards-api.greenhouse.io/v1/boards/figma/jobs" },
  { name: "Swiftly", platform: "Lever", url: "https://api.lever.co/v0/postings/goswift?mode=json" }
];

const roleTerms = {
  "Marketing Coordinator": ["marketing", "brand", "content", "communications"],
  "Software Engineer": ["engineer", "developer", "software"],
  "Data Analyst": ["data", "analytics", "analyst", "insights"],
  "Financial Analyst": ["finance", "financial", "accounting", "revenue"],
  "UX Designer": ["design", "designer", "ux", "product"],
  "Sales Associate": ["sales", "account executive", "business development"],
  "HR Coordinator": ["people", "human resources", "recruit", "talent"],
  "Project Coordinator": ["project", "program", "implementation", "delivery"],
  "Operations Analyst": ["operations", "business operations", "process"],
  "Customer Success Associate": ["customer success", "client success", "customer experience", "support"]
};

const locationTerms = {
  California: ["california", "san francisco", "los angeles"],
  "New York": ["new york", "nyc"], Texas: ["texas", "austin", "dallas"],
  Washington: ["washington", "seattle"], Florida: ["florida", "miami"],
  Illinois: ["illinois", "chicago"], Massachusetts: ["massachusetts", "boston"]
};

const normalizeGreenhouse = source => job => ({
  title: job.title, company: source.name, location: job.location?.name || "Location listed on posting",
  url: job.absolute_url, source: `${source.platform} · official employer board`, postedAt: job.updated_at
});

const normalizeLever = source => job => ({
  title: job.text, company: source.name, location: job.categories?.location || job.categories?.allLocations?.[0] || "Location listed on posting",
  url: job.hostedUrl, source: `${source.platform} · official employer board`, postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null
});

const includesRoleTerm = (title, term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(title);

async function fetchSource(source) {
  const response = await fetch(source.url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${source.name} returned ${response.status}`);
  const payload = await response.json();
  return source.platform === "Greenhouse" ? (payload.jobs || []).map(normalizeGreenhouse(source)) : payload.map(normalizeLever(source));
}

module.exports = async function handler(request, response) {
  const role = String(request.query.role || "");
  const location = String(request.query.location || "National Average");
  const includeRemote = request.query.includeRemote === "true";
  const terms = roleTerms[role];
  if (!terms) return response.status(400).json({ message: "Choose a supported role to find live openings." });
  const settled = await Promise.allSettled(sources.map(fetchSource));
  const allOpenings = settled.flatMap(result => result.status === "fulfilled" ? result.value : []);
  const matchingRole = allOpenings.filter(opening => terms.some(term => includesRoleTerm(opening.title, term)));
  const preferredLocations = locationTerms[location] || [];
  const matchesRemote = opening => /\bremote\b/i.test(opening.location);
  const matchingLocation = preferredLocations.length ? matchingRole.filter(opening => preferredLocations.some(term => opening.location.toLowerCase().includes(term)) || (includeRemote && matchesRemote(opening))) : matchingRole;
  const openings = matchingLocation.slice(0, 5);
  response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return response.status(200).json({ openings, sourceCount: settled.filter(result => result.status === "fulfilled").length, location, includeRemote });
};
