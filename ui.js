window.SalaryUI = (() => {
  const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const formatMoney = value => dollars.format(value);
  const option = (value, label) => `<option value="${value}">${label}</option>`;
  const escapeHtml = text => String(text).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]);
  return {
    populate(data) {
      document.querySelector("#role").insertAdjacentHTML("beforeend", data.roles.map(item => option(item, item)).join(""));
      document.querySelector("#location").insertAdjacentHTML("beforeend", data.locations.map(item => option(item, item)).join(""));
      document.querySelector("#experience").insertAdjacentHTML("beforeend", data.experienceLevels.map(item => option(item, item)).join(""));
    },
    message(text) { document.querySelector("#form-message").textContent = text; },
    showEstimate(estimate, selection) {
      const results = document.querySelector("#results");
      document.querySelector("#results-heading").textContent = `${selection.role} · ${selection.location}`;
      [["minimum", estimate.minimum], ["median", estimate.median], ["maximum", estimate.maximum], ["range-min", estimate.minimum], ["range-max", estimate.maximum]].forEach(([id, value]) => document.querySelector(`#${id}`).textContent = formatMoney(value));
      document.querySelector("#confidence").textContent = `${estimate.confidence} confidence`;
      document.querySelector("#confidence-copy").textContent = `Based on ${estimate.sampleSize} comparable early-career salary observations for this role and location.`;
      document.querySelector("#listing-list").innerHTML = estimate.listings.map(listing => `<li><div><strong>${escapeHtml(listing.title)}</strong><span>${escapeHtml(listing.company)} · ${escapeHtml(listing.location)}</span></div><b>${formatMoney(listing.salary)}</b></li>`).join("");
      results.hidden = false;
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    federalLoading() {
      const section = document.querySelector("#federal-openings");
      section.hidden = false;
      document.querySelector("#federal-status").textContent = "Searching current USAJobs openings…";
      document.querySelector("#federal-list").innerHTML = "";
    },
    federalResults(payload) {
      document.querySelector("#federal-status").textContent = payload.totalCount
        ? `${payload.totalCount.toLocaleString()} matching openings found; showing the first ${payload.openings.length}.`
        : "No current federal openings matched this search.";
      document.querySelector("#federal-list").innerHTML = payload.openings.map(opening => `<li><div><strong>${escapeHtml(opening.title)}</strong><span>${escapeHtml(opening.agency)} · ${escapeHtml(opening.location)}</span><small>${escapeHtml(opening.closeDate)}</small></div><div class="federal-action"><b>${escapeHtml(opening.salary)}</b><a href="${escapeHtml(opening.url)}" target="_blank" rel="noopener noreferrer">View on USAJobs ↗</a></div></li>`).join("");
    },
    federalError(message) {
      document.querySelector("#federal-status").textContent = message;
      document.querySelector("#federal-list").innerHTML = "";
    },
    showRecent(searches, onSelect) {
      const box = document.querySelector("#recent-searches");
      document.querySelector("#clear-searches").hidden = searches.length === 0;
      if (!searches.length) { box.innerHTML = '<p class="empty-state">Your five most recent estimates will appear here.</p>'; return; }
      box.innerHTML = searches.map((search, index) => `<button class="recent-item" type="button" data-index="${index}"><span><strong>${escapeHtml(search.role)}</strong><small>${escapeHtml(search.location)} · ${escapeHtml(search.experience)}</small></span><b>${formatMoney(search.median)}</b><i>View →</i></button>`).join("");
      box.querySelectorAll("button").forEach(button => button.addEventListener("click", () => onSelect(searches[Number(button.dataset.index)])));
    },
    setSelection(selection) { Object.entries(selection).forEach(([name, value]) => { document.querySelector(`#${name}`).value = value; }); }
  };
})();
