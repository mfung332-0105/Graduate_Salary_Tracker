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
      document.querySelector("#confidence-copy").textContent = estimate.confidenceReason || `Based on ${estimate.sampleSize} comparable early-career salary observations for this role and location.`;
      document.querySelector("#listing-list").innerHTML = estimate.listings.map(listing => `<li><div><strong>${escapeHtml(listing.title)}</strong><span>${escapeHtml(listing.company)} · ${escapeHtml(listing.location)}</span><small>${escapeHtml(listing.experience)} · ${escapeHtml(listing.source)}</small><a class="similar-link" href="${escapeHtml(listing.searchUrl)}" target="_blank" rel="noopener noreferrer">Search similar roles ↗</a></div><b>${formatMoney(listing.minimum)}–${formatMoney(listing.maximum)}</b></li>`).join("");
      results.hidden = false;
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    showVisuals(visuals) {
      const chart = points => points.map(point => `<div class="chart-row${point.selected ? " chart-selected" : ""}"><span>${escapeHtml(point.label)}</span><div class="chart-bar"><i style="width:${point.percentage}%"></i></div><b>${formatMoney(point.median)}</b></div>`).join("");
      document.querySelector("#location-chart").innerHTML = chart(visuals.locations);
      document.querySelector("#experience-chart").innerHTML = chart(visuals.experience);
    },
    liveOpeningsLoading() {
      document.querySelector("#live-openings").hidden = false;
      document.querySelector("#live-openings-status").textContent = "Checking official employer boards for matching openings…";
      document.querySelector("#live-openings-list").innerHTML = "";
    },
    showLiveOpenings(payload) {
      const status = document.querySelector("#live-openings-status");
      if (!payload.sourceCount) { status.textContent = "Live employer boards are temporarily unavailable."; return; }
      if (!payload.openings.length) { status.textContent = `No matching live openings were found for ${payload.location}. Try another location or include U.S. remote roles.`; return; }
      status.textContent = `Showing ${payload.openings.length} live opening${payload.openings.length === 1 ? "" : "s"} from ${payload.sourceCount} official employer board${payload.sourceCount === 1 ? "" : "s"} for ${payload.location}${payload.includeRemote ? ", including U.S. remote roles" : ""}.`;
      document.querySelector("#live-openings-list").innerHTML = payload.openings.map(opening => `<li><div><strong>${escapeHtml(opening.title)}</strong><span>${escapeHtml(opening.company)} · Matches selected location: ${escapeHtml(opening.matchedLocation)}</span>${opening.otherLocations.length ? `<small>Also available: ${escapeHtml(opening.otherLocations.join(" · "))}</small>` : ""}<small>${escapeHtml(opening.source)}</small></div><a class="apply-link" href="${escapeHtml(opening.url)}" target="_blank" rel="noopener noreferrer">View official posting ↗</a></li>`).join("");
    },
    liveOpeningsError(message) {
      document.querySelector("#live-openings").hidden = false;
      document.querySelector("#live-openings-status").textContent = message;
      document.querySelector("#live-openings-list").innerHTML = "";
    },
    showRecent(searches, onSelect) {
      const box = document.querySelector("#recent-searches");
      document.querySelector("#clear-searches").hidden = searches.length === 0;
      if (!searches.length) { box.innerHTML = '<p class="empty-state">Your five most recent estimates will appear here.</p>'; return; }
      box.innerHTML = searches.map((search, index) => `<button class="recent-item" type="button" data-index="${index}"><span><strong>${escapeHtml(search.role)}</strong><small>${escapeHtml(search.location)} · ${escapeHtml(search.experience)}</small></span><b>${formatMoney(search.median)}</b><i>View →</i></button>`).join("");
      box.querySelectorAll("button").forEach(button => button.addEventListener("click", () => onSelect(searches[Number(button.dataset.index)])));
    },
    showComparisonChoices(searches) {
      const form = document.querySelector("#comparison-form");
      const empty = document.querySelector("#comparison-empty");
      const result = document.querySelector("#comparison-result");
      if (searches.length < 2) { form.hidden = true; empty.hidden = false; result.hidden = true; return; }
      const options = searches.map((search, index) => `<option value="${index}">${escapeHtml(search.role)} · ${escapeHtml(search.location)} · ${escapeHtml(search.experience)}</option>`).join("");
      document.querySelector("#compare-first").innerHTML = options;
      document.querySelector("#compare-second").innerHTML = options;
      document.querySelector("#compare-second").selectedIndex = 1;
      form.hidden = false; empty.hidden = true; result.hidden = true;
    },
    comparisonMessage(text) { document.querySelector("#comparison-empty").textContent = text; document.querySelector("#comparison-empty").hidden = false; },
    showComparison(first, second) {
      const card = estimate => `<h3>${escapeHtml(estimate.selection.role)}</h3><p>${escapeHtml(estimate.selection.location)} · ${escapeHtml(estimate.selection.experience)}</p><strong>${formatMoney(estimate.minimum)}–${formatMoney(estimate.maximum)}</strong><small>Median ${formatMoney(estimate.median)}</small>`;
      const difference = Math.abs(first.median - second.median);
      const higher = first.median === second.median ? "Both estimates have the same median." : `${first.median > second.median ? first.selection.role : second.selection.role} is higher.`;
      document.querySelector("#comparison-first").innerHTML = card(first);
      document.querySelector("#comparison-second").innerHTML = card(second);
      document.querySelector("#comparison-difference").textContent = formatMoney(difference);
      document.querySelector("#comparison-summary").textContent = higher;
      document.querySelector("#comparison-empty").hidden = true;
      document.querySelector("#comparison-result").hidden = false;
    },
    shareMessage(text) { document.querySelector("#share-message").textContent = text; },
    showShowdownRound(round, score, onChoose) {
      const card = (entry, choice) => `<button class="showdown-card" type="button" data-choice="${choice}"><span class="showdown-choice">Option ${choice === "first" ? "A" : "B"}</span><strong>${escapeHtml(entry.selection.role)}</strong><span>${escapeHtml(entry.selection.location)}</span><small>${escapeHtml(entry.selection.experience)}</small><em>Choose this estimate</em></button>`;
      document.querySelector("#showdown-cards").innerHTML = `${card(round.first, "first")}<span class="showdown-versus" aria-hidden="true">vs</span>${card(round.second, "second")}`;
      document.querySelector("#showdown-score").textContent = `${score.correct} / ${score.rounds} · ${score.rounds ? Math.round((score.correct / score.rounds) * 100) : 0}%`;
      document.querySelector("#showdown-feedback").textContent = "";
      document.querySelector("#showdown-next").hidden = true;
      document.querySelectorAll(".showdown-card").forEach(button => button.addEventListener("click", () => onChoose(button.dataset.choice)));
    },
    showShowdownAnswer(round, selected, score, complete) {
      const winner = round.first.median > round.second.median ? "first" : "second";
      const correct = selected === winner;
      document.querySelectorAll(".showdown-card").forEach(button => {
        const choice = button.dataset.choice;
        button.disabled = true;
        button.classList.toggle("showdown-winner", choice === winner);
        button.classList.toggle("showdown-miss", choice === selected && !correct);
        const estimate = round[choice];
        button.insertAdjacentHTML("beforeend", `<b>Median ${formatMoney(estimate.median)}</b>`);
      });
      const percentage = Math.round((score.correct / score.rounds) * 100);
      document.querySelector("#showdown-score").textContent = `${score.correct} / ${score.rounds} · ${percentage}%`;
      document.querySelector("#showdown-feedback").textContent = complete ? `Game complete — you got ${score.correct} out of ${score.rounds} correct (${percentage}%).` : correct ? "Correct — nice read on the salary range." : `Not quite — ${round[winner].selection.role} has the higher median.`;
      const next = document.querySelector("#showdown-next");
      next.hidden = complete;
    },
    setSelection(selection) { Object.entries(selection).forEach(([name, value]) => { document.querySelector(`#${name}`).value = value; }); }
  };
})();
