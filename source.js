window.SalarySource = {
  async load() {
    const response = await fetch(window.SalaryTrackerConfig.dataUrl);
    if (!response.ok) throw new Error("Salary data could not be loaded.");
    return response.json();
  },
  async federalOpenings(selection) {
    const query = new URLSearchParams(selection);
    const response = await fetch(`${window.SalaryTrackerConfig.usaJobsUrl}?${query}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || "Federal openings could not be loaded right now.");
    return payload;
  }
};
