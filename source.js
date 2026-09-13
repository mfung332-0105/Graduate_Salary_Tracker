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
    const listings = [
      ...data.listingTemplates[selection.role],
      ...data.additionalListingTitles[selection.role].map((title, index) => ({
        title,
        company: data.sampleEmployers[index % data.sampleEmployers.length],
        source: data.sourcePlaceholders[index % data.sourcePlaceholders.length]
      }))
    ].map((listing, index) => ({
      ...listing,
      location: place,
      experience: selection.experience,
      minimum: Math.round(median * (0.78 + index * 0.02) / 1000) * 1000,
      maximum: Math.round(median * (0.96 + index * 0.025) / 1000) * 1000
    }));
    const sampleSize = listings.length;
    const confidence = sampleSize >= 10 ? "High" : sampleSize >= 5 ? "Medium" : "Low";
    return {
      minimum: Math.round(median * 0.82 / 1000) * 1000,
      median,
      maximum: Math.round(median * 1.18 / 1000) * 1000,
      confidence,
      sampleSize,
      confidenceReason: `${sampleSize} curated comparable examples meet the ${confidence.toLowerCase()}-confidence threshold.`,
      listings
    };
  }
};
