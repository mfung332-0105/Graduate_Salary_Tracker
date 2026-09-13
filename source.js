window.SalarySource = {
  async load() {
    const response = await fetch(window.SalaryTrackerConfig.dataUrl);
    if (!response.ok) throw new Error("Salary data could not be loaded.");
    return response.json();
  },
  estimateFor(data, selection) {
    const curated = data.estimates.find(item => item.role === selection.role && item.location === selection.location && item.experience === selection.experience);
    if (curated) return curated;
    const median = Math.round((data.roleBaseMedians[selection.role] * data.locationMultipliers[selection.location] * data.experienceMultipliers[selection.experience]) / 1000) * 1000;
    const place = selection.location === "National Average" ? "United States" : selection.location;
    return {
      minimum: Math.round(median * 0.82 / 1000) * 1000,
      median,
      maximum: Math.round(median * 1.18 / 1000) * 1000,
      confidence: "Medium",
      sampleSize: 32,
      listings: data.listingTemplates[selection.role].map((listing, index) => ({
        ...listing,
        location: place,
        experience: selection.experience,
        minimum: Math.round(median * [0.79, 0.86, 0.93][index] / 1000) * 1000,
        maximum: Math.round(median * [0.99, 1.08, 1.17][index] / 1000) * 1000
      }))
    };
  }
};
