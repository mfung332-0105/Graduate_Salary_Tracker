window.SalarySource = {
  async load() {
    const response = await fetch(window.SalaryTrackerConfig.dataUrl);
    if (!response.ok) throw new Error("Salary data could not be loaded.");
    return response.json();
  }
};
