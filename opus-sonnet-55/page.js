"use strict";
/* Builds the overview table and dossier cards from page-data.js. */
(function () {
  const data = window.OPUS_SONNET_55;
  if (!data) throw new Error("page-data.js did not load; run node opus-sonnet-55/build.js");

  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const rangeKey = (r) => r;
  const COLUMNS = [
    { label: "Icon", sort: null },
    { label: "Unit", sort: (u) => u.name },
    { label: "Type", sort: (u) => u.familyLabel },
    { label: "Move", n: true, sort: (u) => u.move },
    { label: "Rng G", n: true, sort: (u) => rangeKey(u.rngG) },
    { label: "Rng A", n: true, sort: (u) => rangeKey(u.rngA) },
    { label: "Atk G", n: true, sort: (u) => u.atkG },
    { label: "Atk A", n: true, sort: (u) => u.atkA },
    { label: "Def", n: true, sort: (u) => u.def },
    { label: "Reach G", n: true, sort: (u) => (u.reachG === null ? -1 : u.reachG) },
    { label: "Reach A", n: true, sort: (u) => (u.reachA === null ? -1 : u.reachA) },
    { label: "Rules", sort: (u) => u.rules.length },
    { label: "Description", sort: (u) => u.tagline },
  ];

  const state = { family: "all", column: null, direction: 1 };

  function chip(u, faction, big) {
    const box = el("span", big ? "chip big" : "chip");
    const img = el("img");
    img.src = u.icons[faction];
    img.alt = `${u.name} icon, ${faction}`;
    box.appendChild(img);
    return box;
  }

  function numberCell(value, small) {
    const td = el("td", "n");
    if (!value) td.appendChild(el("span", "none", "-"));
    else td.textContent = String(value);
    if (small) td.appendChild(el("small", "", small));
    return td;
  }

  function rangeCell(rng) {
    if (!rng) return numberCell(0);
    return numberCell(rng > 1 ? `2-${rng}` : "1");
  }

  function reachCell(plain, road) {
    if (plain === null) return numberCell(0);
    return numberCell(plain, road !== plain ? `${road} road` : "");
  }

  function row(u) {
    const tr = el("tr");
    const icons = el("td", "icons");
    const pair = el("div", "pair");
    pair.append(chip(u, "union"), chip(u, "xenon"));
    icons.appendChild(pair);
    tr.appendChild(icons);
    const name = el("td", "name");
    const link = el("a", "", u.name);
    link.href = `#${u.id.toLowerCase()}`;
    name.append(link, el("small", "", u.code));
    tr.appendChild(name);
    tr.appendChild(el("td", `fam-${u.family}`, u.familyLabel)).style.fontWeight = "900";
    tr.appendChild(numberCell(u.move));
    tr.appendChild(rangeCell(u.rngG));
    tr.appendChild(rangeCell(u.rngA));
    tr.appendChild(numberCell(u.atkG));
    tr.appendChild(numberCell(u.atkA));
    tr.appendChild(numberCell(u.def));
    tr.appendChild(reachCell(u.reachG, u.reachGRoad));
    tr.appendChild(reachCell(u.reachA, u.reachARoad));
    const rules = el("td");
    for (const r of u.rules) rules.appendChild(el("span", "badge rule", r));
    if (!u.rules.length) rules.appendChild(el("span", "", "-"));
    tr.appendChild(rules);
    tr.appendChild(el("td", "tag", u.tagline));
    return tr;
  }

  function renderTable() {
    const body = document.querySelector("#overview tbody");
    body.replaceChildren();
    let list = data.units.filter((u) => state.family === "all" || u.family === state.family);
    if (state.column !== null) {
      const key = COLUMNS[state.column].sort;
      list = list.slice().sort((a, b) => {
        const x = key(a), y = key(b);
        return (x < y ? -1 : x > y ? 1 : 0) * state.direction;
      });
    }
    for (const u of list) body.appendChild(row(u));
    document.querySelectorAll("#overview th").forEach((th, i) => {
      th.setAttribute("aria-sort", i === state.column ? (state.direction === 1 ? "ascending" : "descending") : "none");
    });
  }

  function renderHead() {
    const tr = el("tr");
    COLUMNS.forEach((col, i) => {
      const th = el("th", col.n ? "n" : "");
      th.scope = "col";
      if (col.sort) {
        const button = el("button", "", col.label);
        button.type = "button";
        button.addEventListener("click", () => {
          state.direction = state.column === i ? -state.direction : 1;
          state.column = i;
          renderTable();
        });
        th.appendChild(button);
      } else {
        th.textContent = col.label;
      }
      tr.appendChild(th);
    });
    document.querySelector("#overview thead").appendChild(tr);
  }

  function renderFilters() {
    const box = document.getElementById("filters");
    const all = [{ id: "all", label: `All ${data.units.length}` }].concat(
      data.families.map((f) => ({ id: f.id, label: `${f.label} ${data.units.filter((u) => u.family === f.id).length}` })));
    for (const f of all) {
      const button = el("button", "", f.label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(f.id === state.family));
      button.addEventListener("click", () => {
        state.family = f.id;
        box.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        renderTable();
      });
      box.appendChild(button);
    }
  }

  function stat(value, label) {
    const s = el("div", "stat");
    s.append(el("b", "", value), el("span", "", label));
    return s;
  }

  function section(card, title, text) {
    card.appendChild(el("h4", "", title));
    card.appendChild(el("p", "", text));
  }

  function renderCards() {
    const box = document.getElementById("cards");
    for (const u of data.units) {
      const card = el("article", "card");
      card.id = u.id.toLowerCase();
      const head = el("header");
      const chips = el("div", "chips");
      chips.append(chip(u, "union", true), chip(u, "xenon", true));
      const title = el("div");
      const h = el("h3", "", `${u.name} ${u.code}`);
      title.append(h, el("p", `tag fam-${u.family}`, `${u.familyLabel}. ${u.tagline}`));
      head.append(chips, title);
      card.appendChild(head);

      const stats = el("div", "stats");
      stats.append(stat(u.move || "-", "move"), stat(u.rngG ? (u.rngG > 1 ? `2-${u.rngG}` : "1") : "-", "range G"),
        stat(u.rngA ? (u.rngA > 1 ? `2-${u.rngA}` : "1") : "-", "range A"), stat(u.atkG || "-", "attack G"),
        stat(u.atkA || "-", "attack A"), stat(u.def, "defense"),
        stat(u.reachG === null ? "-" : u.reachG, "reach G"), stat(u.reachA === null ? "-" : u.reachA, "reach A"));
      card.appendChild(stats);
      if (u.rules.length) {
        const rules = el("p");
        for (const r of u.rules) rules.appendChild(el("span", "badge rule", r));
        card.appendChild(rules);
      }
      card.appendChild(el("p", "fills", `Fills: ${u.gap}`));
      section(card, "What it is", u.what);
      section(card, "How it plays", u.play);
      section(card, "Beaten by", u.beatenBy);
      section(card, "Pairs with", u.pairsWith);
      section(card, "Watch in play tests", u.watch);
      card.appendChild(el("h4", "", "Checked in the engine"));
      const list = el("ul");
      for (const line of u.exhibits) list.appendChild(el("li", "", line));
      card.appendChild(list);
      box.appendChild(card);
    }
  }

  function renderChecks() {
    const list = document.getElementById("checks");
    const items = [
      "The game has no purchase cost, so a weaker copy of a stock unit is not a gap. Each unit opens a rule combination or terrain access that no stock unit has.",
      `Gap screen: a predicate per unit, run over all ${Object.keys(data.stock).length} stock units; zero matches.`,
      `Dominance screen: ${data.dominanceChecked} ordered pairs compared; no unit dominates another.`,
      "Every figure in the dossiers comes from the game's engine, driven by analysis.js. node opus-sonnet-55/verify.js reruns all checks.",
    ];
    for (const text of items) list.appendChild(el("li", "", text));
  }

  renderHead();
  renderFilters();
  renderTable();
  renderCards();
  renderChecks();
})();
