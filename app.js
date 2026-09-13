(() => {
  const { storageKey, maxRecentSearches } = window.SalaryTrackerConfig;
  let data;
  const getRecent = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } };
  const saveRecent = search => {
    const unique = getRecent().filter(item => !(item.role === search.role && item.location === search.location && item.experience === search.experience));
    localStorage.setItem(storageKey, JSON.stringify([search, ...unique].slice(0, maxRecentSearches)));
  };
  const renderRecent = () => SalaryUI.showRecent(getRecent(), search => { SalaryUI.setSelection(search); calculate(search); });
  const generatedEstimate = selection => {
    const median = Math.round((data.roleBaseMedians[selection.role] * data.locationMultipliers[selection.location] * data.experienceMultipliers[selection.experience]) / 1000) * 1000;
    const place = selection.location === "National Average" ? "United States" : selection.location;
    return {
      minimum: Math.round(median * 0.82 / 1000) * 1000,
      median,
      maximum: Math.round(median * 1.18 / 1000) * 1000,
      confidence: "Medium",
      sampleSize: 32,
      listings: [
        { title: selection.role, company: "Arc & Field", location: place, salary: Math.round(median * 0.98 / 1000) * 1000 },
        { title: `${selection.role} I`, company: "Common Ground", location: place, salary: median },
        { title: `Associate ${selection.role}`, company: "Waypoint Group", location: place, salary: Math.round(median * 1.04 / 1000) * 1000 }
      ]
    };
  };
  const calculate = selection => {
    const estimate = data.estimates.find(item => item.role === selection.role && item.location === selection.location && item.experience === selection.experience) || generatedEstimate(selection);
    SalaryUI.message(""); SalaryUI.showEstimate(estimate, selection); saveRecent({ ...selection, median: estimate.median }); renderRecent();
  };
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("#salary-form");
    try { data = await SalarySource.load(); SalaryUI.populate(data); renderRecent(); }
    catch (error) { SalaryUI.message(error.message); return; }
    form.addEventListener("submit", event => { event.preventDefault(); const selection = Object.fromEntries(new FormData(form)); if (Object.values(selection).some(value => !value)) { SalaryUI.message("Please choose a role, location, and experience level."); return; } calculate(selection); });
    document.querySelector("#clear-searches").addEventListener("click", () => { localStorage.removeItem(storageKey); renderRecent(); });
  });
})();
