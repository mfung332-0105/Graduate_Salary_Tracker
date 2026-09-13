(() => {
  const { storageKey, maxRecentSearches } = window.SalaryTrackerConfig;
  let data;
  let currentSelection;
  let includeRemote = false;
  let showdownRound;
  let showdownLocked = false;
  const showdownScore = { correct: 0, rounds: 0 };
  const showdownRoundLimit = 20;
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
    const visuals = SalarySource.visualsFor(data, currentSelection);
    SalaryUI.message(""); SalaryUI.shareMessage(""); SalaryUI.showEstimate(estimate, selection); SalaryUI.showVisuals(visuals); saveRecent({ ...currentSelection, median: estimate.median }); renderRecent(); loadLiveOpenings(currentSelection);
  };
  const loadLiveOpenings = async selection => {
    SalaryUI.liveOpeningsLoading();
    try { SalaryUI.showLiveOpenings(await SalarySource.liveOpenings(selection, includeRemote)); }
    catch (error) { SalaryUI.liveOpeningsError(error.message); }
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
  const randomSelection = () => ({
    role: data.roles[Math.floor(Math.random() * data.roles.length)],
    location: data.locations[Math.floor(Math.random() * data.locations.length)],
    experience: data.experienceLevels[Math.floor(Math.random() * data.experienceLevels.length)]
  });
  const startShowdownRound = () => {
    const firstSelection = randomSelection();
    const first = { selection: firstSelection, ...SalarySource.estimateFor(data, firstSelection) };
    let secondSelection = randomSelection();
    let second = { selection: secondSelection, ...SalarySource.estimateFor(data, secondSelection) };
    for (let attempts = 0; second.median === first.median && attempts < 20; attempts += 1) {
      secondSelection = randomSelection(); second = { selection: secondSelection, ...SalarySource.estimateFor(data, secondSelection) };
    }
    showdownRound = { first, second };
    showdownLocked = false;
    SalaryUI.showShowdownRound(showdownRound, showdownScore, choice => {
      if (showdownLocked) return;
      showdownLocked = true;
      const winner = showdownRound.first.median > showdownRound.second.median ? "first" : "second";
      showdownScore.rounds += 1;
      if (choice === winner) showdownScore.correct += 1;
      SalaryUI.showShowdownAnswer(showdownRound, choice, showdownScore, showdownScore.rounds >= showdownRoundLimit);
    });
  };
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.querySelector("#salary-form");
    try { data = await SalarySource.load(); SalaryUI.populate(data); renderRecent(); startShowdownRound(); }
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
    document.querySelector("#include-remote").addEventListener("change", event => {
      includeRemote = event.target.checked;
      if (currentSelection) loadLiveOpenings(currentSelection);
    });
    document.querySelector("#showdown-next").addEventListener("click", () => {
      if (showdownScore.rounds >= showdownRoundLimit) { showdownScore.correct = 0; showdownScore.rounds = 0; }
      startShowdownRound();
    });
    const sharedSelection = Object.fromEntries(new URLSearchParams(window.location.search));
    if (data.roles.includes(sharedSelection.role) && data.locations.includes(sharedSelection.location) && data.experienceLevels.includes(sharedSelection.experience)) {
      SalaryUI.setSelection(sharedSelection); calculate(sharedSelection); SalaryUI.shareMessage("Viewing a shared estimate.");
    }
  });
})();
