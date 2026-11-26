/* Nusantara Statistics — application logic. Plain JavaScript, no libraries,
   no network: every view is rendered from NUSANTARA in data.js. */

(function () {
  "use strict";

  var D = NUSANTARA;
  var year = D.latestYear;
  var sortKey = "population";
  var sortDir = -1; /* -1 = largest first, 1 = smallest first */
  var query = "";
  var selectedProvince = null;

  var TEAL = "#0f4c4c";
  var TEAL_LIGHT = "#2a7a6e";
  var SAND = "#c98f2e";
  var SAND_LIGHT = "#e3b96a";
  var INK = "#1d2b2b";
  var GRID = "#d8cfba";

  function el(id) { return document.getElementById(id); }
  function fmt(n, decimals) { return n.toFixed(decimals === undefined ? 1 : decimals); }
  function pct(n) { return fmt(n, 1) + "%"; }
  function money(n) { return "NS$ " + fmt(n, 1) + "bn"; }

  /* ---------- canvas helpers ---------- */

  function setupCanvas(canvas, height) {
    var ratio = window.devicePixelRatio || 1;
    var width = canvas.clientWidth || canvas.parentNode.clientWidth || 600;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = height + "px";
    var ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.font = "12px system-ui, sans-serif";
    return { ctx: ctx, width: width, height: height };
  }

  function drawAxes(g, left, top, plotW, plotH, yMax, yLabel) {
    var ctx = g.ctx;
    ctx.strokeStyle = GRID;
    ctx.fillStyle = "#5a6b6b";
    ctx.lineWidth = 1;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var i = 0; i <= 4; i++) {
      var y = top + plotH - (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + plotW, y);
      ctx.stroke();
      ctx.fillText(String(Math.round((yMax * i) / 4)), left - 8, y);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.fillText(yLabel, left, top - 12);
  }

  function lineChart(canvas, labels, values, yMax, yLabel, color) {
    var g = setupCanvas(canvas, 220);
    var ctx = g.ctx;
    var left = 44, top = 26, right = 12, bottom = 28;
    var plotW = g.width - left - right;
    var plotH = g.height - top - bottom;
    drawAxes(g, left, top, plotW, plotH, yMax, yLabel);
    var stepX = plotW / (values.length - 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    values.forEach(function (v, i) {
      var x = left + stepX * i;
      var y = top + plotH - (plotH * v) / yMax;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = color;
    values.forEach(function (v, i) {
      var x = left + stepX * i;
      var y = top + plotH - (plotH * v) / yMax;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      /* Keep the value label inside the plot: left-aligned on the first
         point, right-aligned on the last, centred elsewhere. */
      if (i === 0) { ctx.textAlign = "left"; ctx.fillText(String(v), x + 7, y - 8); }
      else if (i === values.length - 1) { ctx.textAlign = "right"; ctx.fillText(String(v), x - 7, y - 8); }
      else { ctx.textAlign = "center"; ctx.fillText(String(v), x, y - 8); }
    });
    ctx.fillStyle = INK;
    ctx.textBaseline = "top";
    labels.forEach(function (label, i) {
      ctx.fillText(label, left + stepX * i, top + plotH + 8);
    });
  }

  function barChart(canvas, labels, values, yMax, yLabel, color) {
    var g = setupCanvas(canvas, 220);
    var ctx = g.ctx;
    var left = 44, top = 26, right = 12, bottom = 28;
    var plotW = g.width - left - right;
    var plotH = g.height - top - bottom;
    drawAxes(g, left, top, plotW, plotH, yMax, yLabel);
    var slot = plotW / values.length;
    var barW = Math.min(46, slot * 0.62);
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    values.forEach(function (v, i) {
      var h = (plotH * v) / yMax;
      var x = left + slot * i + (slot - barW) / 2;
      ctx.fillRect(x, top + plotH - h, barW, h);
      ctx.fillStyle = INK;
      ctx.textBaseline = "bottom";
      ctx.fillText(String(v), x + barW / 2, top + plotH - h - 4);
      ctx.fillStyle = color;
      ctx.textBaseline = "top";
      ctx.fillText(labels[i], x + barW / 2, top + plotH + 8);
    });
  }

  function donutChart(canvas, parts) {
    var g = setupCanvas(canvas, 220);
    var ctx = g.ctx;
    var cx = 110, cy = 110, r = 82, inner = 52;
    var total = parts.reduce(function (s, p) { return s + p[1]; }, 0);
    var angle = -Math.PI / 2;
    var colors = [TEAL, TEAL_LIGHT, SAND, SAND_LIGHT];
    parts.forEach(function (p, i) {
      var sweep = (Math.PI * 2 * p[1]) / total;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath();
      ctx.fill();
      angle += sweep;
    });
    ctx.beginPath();
    ctx.fillStyle = "#fdfaf1";
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.fillText("GDP", cx, cy - 10);
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("by sector", cx, cy + 10);
    /* legend */
    ctx.textAlign = "left";
    ctx.font = "13px system-ui, sans-serif";
    parts.forEach(function (p, i) {
      var y = 40 + i * 32;
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(220, y - 10, 14, 14);
      ctx.fillStyle = INK;
      ctx.fillText(p[0] + " — " + p[1] + "%", 242, y + 2);
    });
  }

  function pyramidChart(canvas) {
    var g = setupCanvas(canvas, 340);
    var ctx = g.ctx;
    var top = 30, bottom = 26;
    var mid = g.width / 2;
    var plotH = g.height - top - bottom;
    var rowH = plotH / D.pyramid.length;
    var maxV = 4.5; /* widest band, percent */
    var edge = 52; /* room at the outer edges for the percent labels */
    var gap = 34; /* centre column holding the age-group labels */
    var maleArea = mid - gap - edge;
    var femaleArea = g.width - mid - gap - edge;
    ctx.fillStyle = INK;
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Male", edge + maleArea / 2, 14);
    ctx.fillText("Female", mid + gap + femaleArea / 2, 14);
    ctx.font = "12px system-ui, sans-serif";
    D.pyramid.forEach(function (band, i) {
      var y = top + rowH * i + 2;
      var h = rowH - 4;
      var maleW = (maleArea * band[1]) / maxV;
      var femaleW = (femaleArea * band[2]) / maxV;
      ctx.fillStyle = TEAL;
      ctx.fillRect(mid - gap - maleW, y, maleW, h);
      ctx.fillStyle = SAND;
      ctx.fillRect(mid + gap, y, femaleW, h);
      ctx.fillStyle = INK;
      ctx.textAlign = "center";
      ctx.fillText(band[0], mid, y + h / 2 + 4);
      ctx.textAlign = "right";
      ctx.fillText(band[1] + "%", mid - gap - maleW - 6, y + h / 2 + 4);
      ctx.textAlign = "left";
      ctx.fillText(band[2] + "%", mid + gap + femaleW + 6, y + h / 2 + 4);
    });
    ctx.fillStyle = "#5a6b6b";
    ctx.textAlign = "center";
    ctx.fillText("Share of the whole population, " + D.latestYear, mid, g.height - 6);
  }

  /* ---------- views ---------- */

  function statCard(label, value, note) {
    return '<article class="card stat"><p class="stat-label">' + label + "</p>" +
      '<p class="stat-value">' + value + "</p>" +
      '<p class="stat-note">' + note + "</p></article>";
  }

  function viewOverview() {
    var y = D.byYear[year];
    var html = "<h1>Overview — " + year + "</h1>" +
      '<p class="lede">Headline indicators for the Republic of Nusantara, published by ' +
      D.office + ". Figures are updated with each release; pick a year above to look back.</p>" +
      '<section class="grid stats" aria-label="Headline indicators">' +
      statCard("Population", fmt(y.population, 1) + " million", "48.2 million in 2025, growing about 1.2% a year") +
      statCard("GDP", money(y.gdp), "NS$ " + fmt(y.gdp / y.population * 1000, 0) + " per person") +
      statCard("GDP growth", pct(y.growth), "Real growth, year on year") +
      statCard("Unemployment", pct(y.unemployment), "Share of the labour force") +
      statCard("Inflation", pct(y.inflation), "Consumer prices, year on year") +
      statCard("Life expectancy", fmt(y.lifeExpectancy, 1) + " years", "At birth, both sexes") +
      "</section>" +
      '<section class="grid two">' +
      '<article class="card"><h2>GDP growth, 2021–2025</h2>' +
      '<canvas id="chart-growth" role="img" aria-label="Line chart of GDP growth from 2021 to 2025"></canvas></article>' +
      '<article class="card"><h2>GDP by sector, ' + year + '</h2>' +
      '<canvas id="chart-sectors" role="img" aria-label="Chart of GDP by sector"></canvas></article>' +
      "</section>" +
      '<section class="card"><h2>Latest releases</h2><ul class="releases">' +
      D.releases.map(function (r) {
        return "<li><strong>" + r[0] + "</strong> — " + r[1] + ": " + r[2] + "</li>";
      }).join("") + "</ul></section>";
    el("view").innerHTML = html;
    lineChart(el("chart-growth"), D.years.map(String),
      D.years.map(function (yy) { return D.byYear[yy].growth; }), 6, "Percent", TEAL);
    donutChart(el("chart-sectors"), D.sectors[year]);
  }

  function viewPopulation() {
    var y = D.byYear[year];
    var html = "<h1>Population — " + year + "</h1>" +
      '<p class="lede">Nusantara has ' + fmt(y.population, 1) + ' million people across ' +
      D.provinces.length + ' provinces and ' + D.areaKm2.toLocaleString("en-US") +
      ' square kilometres — about ' + Math.round(y.population * 1000000 / D.areaKm2) +
      ' people per square kilometre.</p>' +
      '<section class="grid two">' +
      '<article class="card"><h2>Age pyramid, ' + D.latestYear + '</h2>' +
      '<canvas id="chart-pyramid" role="img" aria-label="Age pyramid chart"></canvas>' +
      '<p class="fine">Children aged 0–14 are 24.1% of the population, working ages 15–64 are 68.3%, and 65 and over are 7.6%.</p></article>' +
      '<article class="card"><h2>Population trend, 2021–2025</h2>' +
      '<canvas id="chart-poptrend" role="img" aria-label="Line chart of population from 2021 to 2025"></canvas>' +
      '<p class="fine">The population grows by roughly half a million people a year. ' +
      'Tanjung Raya, the capital province, holds ' +
      fmt(scaledProvinces()[0].population / D.byYear[year].population * 100, 1) +
      '% of all residents.</p>' +
      '<h3>Largest provinces, ' + year + '</h3><ol class="ranked">' +
      scaledProvinces().slice(0, 5).map(function (p) {
        return "<li>" + p.name + " — " + fmt(p.population, 1) + " million</li>";
      }).join("") + "</ol></article></section>";
    el("view").innerHTML = html;
    pyramidChart(el("chart-pyramid"));
    lineChart(el("chart-poptrend"), D.years.map(String),
      D.years.map(function (yy) { return D.byYear[yy].population; }), 50, "Millions", TEAL_LIGHT);
  }

  function viewEconomy() {
    var y = D.byYear[year];
    var surplus = y.exports - y.imports;
    var html = "<h1>Economy — " + year + "</h1>" +
      '<p class="lede">GDP of ' + money(y.gdp) + ' grew ' + pct(y.growth) +
      ' in real terms. Trade ran a surplus of NS$ ' + fmt(surplus, 1) + ' billion.</p>' +
      '<section class="grid stats" aria-label="Economy indicators">' +
      statCard("GDP", money(y.gdp), "NS$ " + fmt(y.gdp / y.population * 1000, 0) + " per person") +
      statCard("GDP growth", pct(y.growth), "Real growth, year on year") +
      statCard("Exports", money(y.exports), "Top export: " + D.topExports[0]) +
      statCard("Imports", money(y.imports), "Top import: " + D.topImports[0]) +
      statCard("Inflation", pct(y.inflation), "Consumer prices, year on year") +
      statCard("Unemployment", pct(y.unemployment), "Share of the labour force") +
      "</section>" +
      '<section class="grid two">' +
      '<article class="card"><h2>GDP by sector, ' + year + '</h2>' +
      '<canvas id="chart-sectors2" role="img" aria-label="Bar chart of GDP by sector"></canvas></article>' +
      '<article class="card"><h2>Inflation, 2021–2025</h2>' +
      '<canvas id="chart-inflation" role="img" aria-label="Line chart of inflation from 2021 to 2025"></canvas></article>' +
      "</section>" +
      '<section class="grid two">' +
      '<article class="card"><h2>Trade, ' + year + '</h2><ul class="kv">' +
      "<li><span>Exports</span><strong>" + money(y.exports) + "</strong></li>" +
      "<li><span>Imports</span><strong>" + money(y.imports) + "</strong></li>" +
      "<li><span>Balance</span><strong>NS$ " + fmt(surplus, 1) + "bn surplus</strong></li></ul>" +
      "<h3>Top exports</h3><p>" + D.topExports.join(" · ") + "</p>" +
      "<h3>Top imports</h3><p>" + D.topImports.join(" · ") + "</p></article>" +
      '<article class="card"><h2>How the sectors moved</h2>' +
      "<p>Services have grown every year since 2021, from 50.1% of GDP to 52.4% in " + year +
      ", while agriculture's share eased from 14.4% to 12.9% as farm work mechanised. " +
      "Industry held near 27% and mining near 8% across the same five years.</p>" +
      "<p>Growth stayed above 3.9% in every year shown, and inflation fell from 4.8% in 2021 to " +
      fmt(D.byYear[D.latestYear].inflation, 1) + "% in " + D.latestYear + ".</p></article>" +
      "</section>";
    el("view").innerHTML = html;
    barChart(el("chart-sectors2"), D.sectors[year].map(function (s) { return s[0]; }),
      D.sectors[year].map(function (s) { return s[1]; }), 60, "Percent of GDP", TEAL);
    lineChart(el("chart-inflation"), D.years.map(String),
      D.years.map(function (yy) { return D.byYear[yy].inflation; }), 5, "Percent", SAND);
  }

  /* Provincial figures are published for 2025. For earlier years they are
     scaled by the national totals, so the year selector stays meaningful on
     the Provinces page and the shares still add up. */
  function scaledProvinces() {
    var y = D.byYear[year];
    var popScale = y.population / D.byYear[D.latestYear].population;
    var gdpScale = y.gdp / D.byYear[D.latestYear].gdp;
    return D.provinces.map(function (p) {
      return {
        name: p.name, capital: p.capital, area: p.area, coast: p.coast,
        population: Math.round(p.population * popScale * 10) / 10,
        gdp: Math.round(p.gdp * gdpScale * 10) / 10
      };
    });
  }

  function filteredProvinces() {
    var list = scaledProvinces().filter(function (p) {
      if (!query) return true;
      var q = query.toLowerCase();
      return p.name.toLowerCase().indexOf(q) !== -1 ||
        p.capital.toLowerCase().indexOf(q) !== -1;
    });
    list.sort(function (a, b) {
      var av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") return sortDir * av.localeCompare(bv);
      return sortDir * (av - bv);
    });
    return list;
  }

  function provinceRow(p) {
    var share = (p.population / D.byYear[year].population) * 100;
    var gdpPc = (p.gdp * 1000) / p.population;
    return "<tr data-province=\"" + p.name + "\" tabindex=\"0\">" +
      "<td>" + p.name + "</td><td>" + p.capital + "</td>" +
      "<td class=\"num\">" + fmt(p.population, 1) + "</td>" +
      "<td class=\"num\">" + fmt(p.gdp, 1) + "</td>" +
      "<td class=\"num\">" + fmt(gdpPc, 0) + "</td>" +
      "<td class=\"num\">" + fmt(share, 1) + "%</td></tr>";
  }

  function viewProvinces() {
    var list = filteredProvinces();
    var all = scaledProvinces().slice().sort(function (a, b) { return b.population - a.population; });
    var arrow = function (key) { return sortKey === key ? (sortDir === -1 ? " ▼" : " ▲") : ""; };
    var html = "<h1>Provinces — " + year + "</h1>" +
      '<p class="lede">Twelve provinces, from ' + all[0].name + " at " + fmt(all[0].population, 1) +
      " million people to " + all[all.length - 1].name + " at " + fmt(all[all.length - 1].population, 1) +
      " million. Provincial figures for earlier years are scaled from the 2025 census by the national totals. " +
      "Click a column heading to sort, type in the search box to filter, and click a row for its detail.</p>" +
      '<div class="toolbar"><label for="prov-search">Search provinces</label>' +
      '<input id="prov-search" type="search" placeholder="Name or capital city…" value="' + query.replace(/"/g, "&quot;") + '">' +
      '<span class="count">' + list.length + " of " + D.provinces.length + " provinces</span></div>" +
      '<div class="table-wrap"><table><thead><tr>' +
      '<th data-sort="name">Province' + arrow("name") + "</th>" +
      '<th data-sort="capital">Capital' + arrow("capital") + "</th>" +
      '<th data-sort="population" class="num">Population (m)' + arrow("population") + "</th>" +
      '<th data-sort="gdp" class="num">GDP (NS$ bn)' + arrow("gdp") + "</th>" +
      '<th class="num">GDP per person (NS$)</th>' +
      '<th class="num">Share of population</th>' +
      "</tr></thead><tbody>" +
      (list.length ? list.map(provinceRow).join("") :
        '<tr><td colspan="6">No province matches "' + query.replace(/</g, "&lt;") + '".</td></tr>') +
      "</tbody></table></div>" +
      '<div id="prov-detail" aria-live="polite">' +
      (selectedProvince ? provinceDetail(selectedProvince) : "") + "</div>";
    el("view").innerHTML = html;
    el("prov-search").addEventListener("input", function (e) {
      query = e.target.value;
      render(false);
      var box = el("prov-search");
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    });
    var heads = el("view").querySelectorAll("th[data-sort]");
    Array.prototype.forEach.call(heads, function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-sort");
        if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = key === "name" || key === "capital" ? 1 : -1; }
        render(false);
      });
    });
    var rows = el("view").querySelectorAll("tbody tr[data-province]");
    Array.prototype.forEach.call(rows, function (tr) {
      var pick = function () {
        selectedProvince = tr.getAttribute("data-province");
        render(false);
      };
      tr.addEventListener("click", pick);
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter") pick(); });
    });
  }

  function provinceDetail(name) {
    var p = null;
    scaledProvinces().forEach(function (prov) { if (prov.name === name) p = prov; });
    if (!p) return "";
    var share = (p.population / D.byYear[year].population) * 100;
    var gdpPc = (p.gdp * 1000) / p.population;
    var density = Math.round(p.population * 1000000 / p.area);
    var biggest = Math.max.apply(null, scaledProvinces().map(function (prov) { return prov.population; }));
    var barW = Math.min(100, (p.population / biggest) * 100);
    return '<article class="card detail"><h2>' + p.name + '</h2>' +
      '<p class="fine">Capital ' + p.capital + " · " + p.coast + " · " + p.area.toLocaleString("en-US") +
      " km² · " + density + " people per km²</p>" +
      '<ul class="kv"><li><span>Population (' + year + ')</span><strong>' + fmt(p.population, 1) +
      " million (" + fmt(share, 1) + "% of Nusantara)</strong></li>" +
      "<li><span>GDP (" + year + ")</span><strong>" + money(p.gdp) + "</strong></li>" +
      "<li><span>GDP per person</span><strong>NS$ " + fmt(gdpPc, 0) + "</strong></li></ul>" +
      '<p class="bar-label">Population vs the largest province</p>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + fmt(barW, 0) + '%"></div></div>' +
      "</article>";
  }

  function viewHealth() {
    var y = D.byYear[year];
    var html = "<h1>Health &amp; Education — " + year + "</h1>" +
      '<p class="lede">Nusantarans live longer and stay in school longer than five years ago: ' +
      "life expectancy reached " + fmt(y.lifeExpectancy, 1) + " years in " + year + ".</p>" +
      '<section class="grid stats" aria-label="Health and education indicators">' +
      statCard("Literacy", pct(y.literacy), "Adults aged 15 and over") +
      statCard("Schooling", fmt(y.schooling, 1) + " years", "Mean years of schooling") +
      statCard("Life expectancy", fmt(y.lifeExpectancy, 1) + " years", "At birth, both sexes") +
      statCard("Hospital beds", fmt(y.beds, 1) + " per 10,000", "Public and private beds") +
      statCard("Doctors", fmt(y.doctors, 1) + " per 10,000", "Registered doctors") +
      statCard("Infant mortality", fmt(y.infantMortality, 1) + " per 1,000", "Deaths under one year") +
      "</section>" +
      '<section class="grid two">' +
      '<article class="card"><h2>Literacy and schooling, 2021–2025</h2>' +
      '<canvas id="chart-literacy" role="img" aria-label="Line chart of literacy from 2021 to 2025"></canvas>' +
      "<p class=\"fine\">Adult literacy rose from 95.1% in 2021 to 96.8% in " + year +
      ", and mean schooling from 11.6 to 12.4 years.</p></article>" +
      '<article class="card"><h2>Health capacity, ' + year + '</h2>' +
      '<canvas id="chart-beds" role="img" aria-label="Bar chart of hospital beds and doctors"></canvas>' +
      "<p class=\"fine\">Infant mortality fell from 13.8 per 1,000 live births in 2021 to " +
      fmt(y.infantMortality, 1) + " in " + year + ".</p></article>" +
      "</section>";
    el("view").innerHTML = html;
    lineChart(el("chart-literacy"), D.years.map(String),
      D.years.map(function (yy) { return D.byYear[yy].literacy; }), 100, "Percent", TEAL);
    barChart(el("chart-beds"), ["Beds", "Doctors"],
      [y.beds, y.doctors], 20, "Per 10,000 people", TEAL_LIGHT);
  }

  function viewAbout() {
    el("view").innerHTML = "<h1>Methodology &amp; About</h1>" +
      '<article class="card"><h2>About this site</h2>' +
      "<p><strong>Nusantara Statistics</strong> is the statistics office of the Republic of Nusantara, " +
      "a fictional island republic. It publishes headline indicators, population, economy, province, " +
      "health and education figures for the country, in the style of a national statistics office.</p>" +
      "<h2>Are these figures real?</h2>" +
      "<p>No. Every number on this site is invented for illustration. Nusantara does not exist, " +
      "and no figure here describes any real country. The figures are, however, internally consistent: " +
      "provincial populations sum to the national total, provincial GDP sums to national GDP, " +
      "sector shares sum to 100%, and the age pyramid sums to 100%.</p>" +
      "<h2>How the figures are made</h2>" +
      "<ul><li>Population: yearly estimates built from the twelve provincial counts.</li>" +
      "<li>GDP: national accounts in NS$ billions, with sector shares from the same accounts.</li>" +
      "<li>Prices and labour: consumer price index and labour force survey, each year.</li>" +
      "<li>Health and education: administrative records from hospitals and schools.</li></ul>" +
      "<h2>Using the figures</h2>" +
      "<p>Use the year selector in the header to move between 2021 and 2025. On the Provinces page, " +
      "click a column heading to sort, type to search, and click a row for a province's detail. " +
      "All charts are drawn by this site itself; nothing is loaded from another website.</p>" +
      "<p class=\"fine\">Badan Statistik Nusantara · Kota Tanjung · Published 26 November 2026 · " +
      "Next release: population estimate 2026, 12 November 2026.</p></article>";
  }

  var views = {
    overview: viewOverview,
    population: viewPopulation,
    economy: viewEconomy,
    provinces: viewProvinces,
    health: viewHealth,
    about: viewAbout
  };

  function currentRoute() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    return views[hash] ? hash : "overview";
  }

  function render(updateNav) {
    var route = currentRoute();
    if (updateNav !== false) {
      var links = document.querySelectorAll("nav a");
      Array.prototype.forEach.call(links, function (a) {
        var r = a.getAttribute("href").replace(/^#\/?/, "");
        if (r === route) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    }
    views[route]();
    window.scrollTo(0, 0);
  }

  function init() {
    var select = el("year-select");
    D.years.forEach(function (yy) {
      var opt = document.createElement("option");
      opt.value = yy;
      opt.textContent = yy;
      if (yy === year) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      year = Number(select.value);
      render(false);
    });
    window.addEventListener("hashchange", function () { render(); });
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
