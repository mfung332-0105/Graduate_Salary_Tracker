const USAJOBS_URL = "https://data.usajobs.gov/api/search";

const locationNames = {
  "National Average": "United States", California: "California", "New York": "New York",
  Texas: "Texas", Washington: "Washington", Florida: "Florida", Illinois: "Illinois", Massachusetts: "Massachusetts"
};

const salary = descriptor => {
  const pay = descriptor.PositionRemuneration?.[0];
  return pay?.MinimumRange && pay?.MaximumRange
    ? `$${Number(pay.MinimumRange).toLocaleString()}–$${Number(pay.MaximumRange).toLocaleString()}`
    : "See listing";
};

module.exports = async function handler(request, response) {
  const apiKey = process.env.USAJOBS_API_KEY;
  const userAgent = process.env.USAJOBS_USER_AGENT;
  if (!apiKey || !userAgent) return response.status(503).json({ message: "Live USAJobs results are not configured yet. Add the USAJOBS_API_KEY and USAJOBS_USER_AGENT environment variables in Vercel." });

  const role = String(request.query.role || "").trim();
  if (!role) return response.status(400).json({ message: "A role is required to search federal openings." });
  const params = new URLSearchParams({ Keyword: role, LocationName: locationNames[request.query.location] || "United States", ResultsPerPage: "5", SortField: "openingdate" });
  try {
    const usaJobsResponse = await fetch(`${USAJOBS_URL}?${params}`, { headers: { Host: "data.usajobs.gov", "User-Agent": userAgent, "Authorization-Key": apiKey } });
    if (!usaJobsResponse.ok) throw new Error(`USAJobs returned ${usaJobsResponse.status}.`);
    const result = (await usaJobsResponse.json()).SearchResult || {};
    const openings = (result.SearchResultItems || []).map(item => item.MatchedObjectDescriptor).filter(Boolean).map(descriptor => ({
      title: descriptor.PositionTitle || "Untitled federal role", agency: descriptor.OrganizationName || "Federal agency",
      location: descriptor.PositionLocationDisplay || "Location listed on USAJobs", salary: salary(descriptor),
      closeDate: descriptor.PositionEndDate ? `Closes ${new Date(descriptor.PositionEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "Check listing for close date",
      url: descriptor.PositionURI || "https://www.usajobs.gov/"
    }));
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return response.status(200).json({ totalCount: result.SearchResultCountAll || 0, openings });
  } catch {
    return response.status(502).json({ message: "Live USAJobs results are temporarily unavailable. Please try again shortly." });
  }
}
