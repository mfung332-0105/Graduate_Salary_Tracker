(() => {
  const { storageKey, maxRecentSearches } = window.SalaryTrackerConfig;
  let data;
  let currentSelection;
  const getRecent = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } };
  const saveRecent = search => {
    const unique = getRecent().filter(item => !(item.role === search.role && item.location === search.location && item.experience === search.experience));
    localStorage.setItem(storageKey, JSON.stringify([search, ...unique].slice(0, maxRecentSearches)));
  };
  const renderRecent = () => {
    const searches = getRecent();
    SalaryUI.showRecent(searches, search => { SalaryUI.setSelection(search); calculate(search); });
    SalaryUI.showComparisonChoices(searches);
  };
  const calculate = selection => {
    const estimate = SalarySource.estimateFor(data, selection);
    currentSelection = { role: selection.role, location: selection.location, experience: selection.experience };
    SalaryUI.message(""); SalaryUI.shareMessage(""); SalaryUI.showEstimate(estimate, selection); saveRecent({ ...currentSelection, median: estimate.median }); renderRecent();
  };
  const shareCurrentEstimate = async () => {
    if (!currentSelection) return;
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(currentSelection).toString();
    const shareData = { title: "Graduate Salary Tracker estimate", text: `${currentSelection.role} · ${currentSelection.location} · ${currentSelection.experience}`, url: url.toString() };
    try {
      if (navigator.share) { await navigator.share(shareData); SalaryUI.shareMessage("Share sheet opened."); return; }
      await navigator.clipboard.writeText(url.toString());
      SalaryUI.shareMessage("Share link copied to your clipboard.");
    } catch (error) {
      if (error.name === "AbortError") return;
      const field = document.createElement("textarea");
      field.value = url.toString(); document.body.append(field); field.select(); document.execCommand("copy"); field.remove();
      SalaryUI.shareMessage("Share link copied to your clipboard.");
    }
  };
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("#salary-form");
    try { data = await SalarySource.load(); SalaryUI.populate(data); renderRecent(); }
    catch (error) { SalaryUI.message(error.message); return; }
    form.addEventListener("submit", event => { event.preventDefault(); const selection = Object.fromEntries(new FormData(form)); if (Object.values(selection).some(value => !value)) { SalaryUI.message("Please choose a role, location, and experience level."); return; } calculate(selection); });
    document.querySelector("#clear-searches").addEventListener("click", () => { localStorage.removeItem(storageKey); renderRecent(); });
    document.querySelector("#comparison-form").addEventListener("submit", event => {
      event.preventDefault();
      const searches = getRecent();
      const firstIndex = Number(document.querySelector("#compare-first").value);
      const secondIndex = Number(document.querySelector("#compare-second").value);
      if (firstIndex === secondIndex) { SalaryUI.comparisonMessage("Choose two different saved estimates to compare."); return; }
      const firstSelection = searches[firstIndex]; const secondSelection = searches[secondIndex];
      const first = { selection: firstSelection, ...SalarySource.estimateFor(data, firstSelection) };
      const second = { selection: secondSelection, ...SalarySource.estimateFor(data, secondSelection) };
      SalaryUI.showComparison(first, second);
    });
    document.querySelector("#share-result").addEventListener("click", shareCurrentEstimate);
    const sharedSelection = Object.fromEntries(new URLSearchParams(window.location.search));
    if (data.roles.includes(sharedSelection.role) && data.locations.includes(sharedSelection.location) && data.experienceLevels.includes(sharedSelection.experience)) {
      SalaryUI.setSelection(sharedSelection); calculate(sharedSelection); SalaryUI.shareMessage("Viewing a shared estimate.");
    }
  });
})();
