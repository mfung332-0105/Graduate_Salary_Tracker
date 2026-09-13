(() => {
  const { storageKey, maxRecentSearches } = window.SalaryTrackerConfig;
  let data;
  const getRecent = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } };
  const saveRecent = search => {
    const unique = getRecent().filter(item => !(item.role === search.role && item.location === search.location && item.experience === search.experience));
    localStorage.setItem(storageKey, JSON.stringify([search, ...unique].slice(0, maxRecentSearches)));
  };
  const renderRecent = () => SalaryUI.showRecent(getRecent(), search => { SalaryUI.setSelection(search); calculate(search); });
  const calculate = selection => {
    const estimate = SalarySource.estimateFor(data, selection);
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
