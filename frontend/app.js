const API_LIST = "/api/energy-drinks/";

let drinks = [];

const grid = document.getElementById("grid");

/** @type {Record<string, Chart>} */
let chartByDrinkId = {};

const RADAR_LABELS = [
  "кислота",
  "сладость",
  "газированность",
  "концентрация",
  "послевкусие",
  "цена/качество",
];

/** [select id, поле в API] */
const CATALOG_METRIC_FILTERS = [
  ["filterAcidity", "acidity"],
  ["filterSweetness", "sweetness"],
  ["filterCarbonation", "carbonation"],
  ["filterConcentration", "concentration"],
  ["filterAftertaste", "aftertaste"],
  ["filterPriceQuality", "price_quality"],
];

function searchQuery() {
  const el = document.getElementById("headerSearch");
  return (el && el.value ? el.value : "").trim().toLowerCase();
}

function passesMetricFilters(d) {
  for (const [selectId, key] of CATALOG_METRIC_FILTERS) {
    const el = document.getElementById(selectId);
    if (!el || el.value === "") continue;
    if (Number(d[key]) !== Number(el.value)) return false;
  }
  return true;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : String(s);
  return div.innerHTML;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getReviewsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("reviews")) || {};
  } catch {
    return {};
  }
}

function userAverageRating(drinkId) {
  const reviews = getReviewsFromStorage();
  const list = reviews[String(drinkId)];
  if (!list || !list.length) return null;
  const nums = list
    .map((r) => parseFloat(r.rating))
    .filter((n) => !Number.isNaN(n));
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function showCatalogError(message) {
  grid.innerHTML = `<p class="catalog-error">${escapeHtml(
    message
  )}</p>`;
}

function loadDrinks() {
  fetch(API_LIST)
    .then((r) => {
      if (!r.ok) {
        return r.text().then((t) => {
          throw new Error(t || r.statusText);
        });
      }
      return r.json();
    })
    .then((data) => {
      drinks = Array.isArray(data) ? data : [];
      updateView();
    })
    .catch((err) => {
      drinks = [];
      showCatalogError(
        "Не удалось загрузить каталог из API. " +
          (err.message || "Проверьте, что бэкенд доступен.")
      );
    });
}

loadDrinks();

function updateView() {
  if (!drinks.length && grid.querySelector(".catalog-error")) {
    return;
  }

  let filtered = drinks.filter((d) => {
    const q = searchQuery();
    const sugar = document.getElementById("sugarFilter").checked;
    return (
      String(d.name).toLowerCase().includes(q) &&
      (!sugar || d.no_sugar) &&
      passesMetricFilters(d)
    );
  });

  let sort = document.getElementById("sort").value;
  if (sort === "rating") {
    filtered.sort(
      (a, b) => avg(DrinkModel.scores(b)) - avg(DrinkModel.scores(a))
    );
  } else if (sort === "price") {
    filtered.sort((a, b) => {
      const ap = a.price == null || a.price === "" ? Infinity : Number(a.price);
      const bp = b.price == null || b.price === "" ? Infinity : Number(b.price);
      return ap - bp;
    });
  }

  render(filtered);
}

function avg(arr) {
  return arr.reduce((x, y) => x + y, 0) / arr.length;
}

function stars(v) {
  let full = Math.floor(v);
  let half = v % 1 >= 0.5 ? 1 : 0;
  let empty = 5 - full - half;
  let s = "";
  for (let i = 0; i < full; i++) s += "⭐";
  if (half) s += "⭐";
  for (let i = 0; i < empty; i++) s += "☆";
  return s + " " + v.toFixed(1);
}

function destroyCatalogCharts() {
  Object.values(chartByDrinkId).forEach((c) => {
    try {
      c.destroy();
    } catch {
      /* ignore */
    }
  });
  chartByDrinkId = {};
}

function card(d) {
  const scores = DrinkModel.scores(d);
  const adminAvg = avg(scores);
  const userAvg = userAverageRating(d.id);
  const userAvgText =
    userAvg != null ? userAvg.toFixed(1) : "—";

  let metricsStars = `
<div class="metrics-stars">
<p>Кислота: ${stars(scores[0])}</p>
<p>Сладость: ${stars(scores[1])}</p>
<p>Газированность: ${stars(scores[2])}</p>
<p>Концентрация: ${stars(scores[3])}</p>
<p>Послевкусие: ${stars(scores[4])}</p>
<p>Цена/качество: ${stars(scores[5])}</p>
</div>
`;

  let radarMetrics = `
<div class="radar-metrics">
<p>Кислота: ${Math.round(scores[0])}</p>
<p>Сладость: ${Math.round(scores[1])}</p>
<p>Газированность: ${Math.round(scores[2])}</p>
<p>Концентрация: ${Math.round(scores[3])}</p>
<p>Послевкусие: ${Math.round(scores[4])}</p>
<p>Цена/качество: ${Math.round(scores[5])}</p>
</div>
`;

  const src = DrinkModel.imageUrl(d);
  const imgBlock = src
    ? `<img src="${escapeAttr(src)}" alt="" loading="lazy" />`
    : `<div class="card-placeholder">Нет изображения</div>`;

  const priceText =
    d.price != null && d.price !== ""
      ? `${escapeHtml(String(d.price))}\u00a0₽`
      : "—";

  const chartId = `chart-drink-${d.id}`;

  return `
<div class="card" data-flavor="classic" data-nosugar="${
    d.no_sugar ? "true" : "false"
  }" data-view="radar" data-drink-id="${escapeAttr(String(d.id))}">

${imgBlock}

<div class="title">${escapeHtml(d.name)}</div>

<div class="card-ratings-row" aria-label="Оценки">
  <div class="card-ratings-row__item">
    <span class="card-ratings-row__label">админ.</span>
    <span class="card-ratings-row__star" aria-hidden="true">⭐</span>
    <span class="card-ratings-row__value">${adminAvg.toFixed(1)}</span>
  </div>
  <span class="card-ratings-row__sep" aria-hidden="true"></span>
  <div class="card-ratings-row__item card-ratings-row__item--user">
    <span class="card-ratings-row__label">средняя пользовательская</span>
    <span class="card-ratings-row__value">${userAvgText}</span>
  </div>
</div>

<div class="price">${priceText}</div>

<label class="radar-visibility-toggle">
  <input type="checkbox" class="js-toggle-radar" checked data-drink-id="${escapeAttr(
    String(d.id)
  )}" />
  <span class="radar-visibility-toggle__text">Показать диаграмму</span>
</label>

<button type="button" class="viewToggle" onclick="toggleView(this)">⭐ рейтинг</button>

<div class="details">

${metricsStars}

${radarMetrics}

<div class="boolean ${d.no_sugar ? "true" : "false"}">
без сахара ${d.no_sugar ? "✔" : "❌"}
</div>

<div class="radar-chart-wrap">
<canvas class="radar" id="${chartId}" height="200"></canvas>
</div>

<button type="button" class="review-btn" onclick="window.location.href='reviews.html?id=${encodeURIComponent(
    String(d.id)
  )}'">Отзывы</button>

</div>

</div>
`;
}

function wireCardHover(card) {
  card.addEventListener("mouseenter", function () {
    document.querySelectorAll(".card").forEach((c) => c.classList.remove("hovered"));
    this.classList.add("hovered");
  });
  card.addEventListener("mouseleave", function () {
    this.classList.remove("hovered");
  });
}

(function bindCatalogFilters() {
  const headerSearch = document.getElementById("headerSearch");
  if (headerSearch) headerSearch.addEventListener("input", updateView);
  document.getElementById("sort").addEventListener("change", updateView);
  document.getElementById("sugarFilter").addEventListener("change", updateView);
  CATALOG_METRIC_FILTERS.forEach(([id]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", updateView);
  });
})();

grid.addEventListener("change", (e) => {
  const t = e.target;
  if (!t.classList.contains("js-toggle-radar")) return;
  const drinkId = t.getAttribute("data-drink-id");
  const cardEl = t.closest(".card");
  const wrap = cardEl && cardEl.querySelector(".radar-chart-wrap");
  if (!wrap) return;
  wrap.hidden = !t.checked;
  const ch = chartByDrinkId[drinkId];
  if (ch && t.checked) {
    requestAnimationFrame(() => ch.resize());
  }
});

function toggleView(btn) {
  let card = btn.closest(".card");
  let current = card.dataset.view;
  let newView = current === "radar" ? "stars" : "radar";
  card.dataset.view = newView;
  btn.textContent = newView === "radar" ? "⭐ рейтинг" : "📊 диаграмма";
}

function radarChartOptions() {
  return {
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          showLabelBackdrop: false,
          callback(value) {
            const n = Number(value);
            if (n < 1 || n > 5) return "";
            if (Math.abs(n - Math.round(n)) > 1e-6) return "";
            return String(Math.round(n));
          },
        },
        pointLabels: {
          color: "white",
          font: { size: 12 },
        },
        grid: {
          color: "rgba(255,255,255,0.2)",
        },
        angleLines: {
          color: "rgba(255,255,255,0.25)",
        },
      },
    },
  };
}

function render(list) {
  destroyCatalogCharts();

  grid.innerHTML = "";

  list.forEach((d) => {
    grid.innerHTML += card(d);
  });

  document.querySelectorAll(".card").forEach(wireCardHover);

  list.forEach((d) => {
    const canvas = document.getElementById(`chart-drink-${d.id}`);
    if (!canvas) return;
    const scores = DrinkModel.scores(d);
    const ch = new Chart(canvas, {
      type: "radar",
      data: {
        labels: RADAR_LABELS,
        datasets: [
          {
            data: scores.map((s) => Math.round(s)),
            borderColor: "#ffffff",
            backgroundColor: "rgba(255,255,255,.35)",
          },
        ],
      },
      options: radarChartOptions(),
    });
    chartByDrinkId[String(d.id)] = ch;
  });
}

function setupCatalogHeader() {
  const btn = document.getElementById("filterMenuBtn");
  const panel = document.getElementById("filterDropdown");
  if (!btn || !panel) return;

  function closePanel() {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  }

  function openPanel() {
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (panel.hidden) openPanel();
    else closePanel();
  });

  document.addEventListener("click", () => {
    if (!panel.hidden) closePanel();
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });
}

setupCatalogHeader();
