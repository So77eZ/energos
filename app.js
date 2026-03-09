let drinks = [];

const grid = document.getElementById("grid");

fetch("drinks.json")
  .then((r) => r.json())
  .then((data) => {
    drinks = data;
    updateView();
  });

function updateView() {
  let filtered = drinks.filter((d) => {
    let search = document.getElementById("search").value.toLowerCase();
    let sugar = document.getElementById("sugarFilter").checked;
    return d.name.toLowerCase().includes(search) && (!sugar || d.nosugar);
  });

  let sort = document.getElementById("sort").value;
  if (sort === "rating") {
    filtered.sort((a, b) => avg(b.scores) - avg(a.scores));
  } else if (sort === "price") {
    filtered.sort((a, b) => a.price - b.price);
  }

  console.log("Filtered drinks:", filtered.length);
  render(filtered);
}

function avg(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

function stars(v) {
  let full = Math.floor(v);
  let half = v % 1 >= 0.5 ? 1 : 0;
  let empty = 5 - full - half;
  let s = "";
  for (let i = 0; i < full; i++) s += "⭐";
  if (half) s += "⭐"; // For half, we can use a different symbol or CSS, but for now full
  for (let i = 0; i < empty; i++) s += "☆";
  return s + " " + v.toFixed(1);
}

function card(d, i) {
  let rating = avg(d.scores);

  let metricsStars = `
<div class="metrics-stars">
<p>Кислота: ${stars(d.scores[0])}</p>
<p>Сладость: ${stars(d.scores[1])}</p>
<p>Газированность: ${stars(d.scores[2])}</p>
<p>Концентрация: ${stars(d.scores[3])}</p>
<p>Послевкусие: ${stars(d.scores[4])}</p>
<p>Энергия: ${stars(d.scores[5])}</p>
<p>Цена: ${stars(d.scores[6])}</p>
</div>
`;

  let radarMetrics = `
<div class="radar-metrics">
<p>Кислота: ${Math.round(d.scores[0])}</p>
<p>Сладость: ${Math.round(d.scores[1])}</p>
<p>Газированность: ${Math.round(d.scores[2])}</p>
<p>Концентрация: ${Math.round(d.scores[3])}</p>
<p>Послевкусие: ${Math.round(d.scores[4])}</p>
<p>Энергия: ${Math.round(d.scores[5])}</p>
<p>Цена: ${Math.round(d.scores[6])}</p>
</div>
`;

  return `

<div class="card" data-flavor="${d.flavor}" data-nosugar="${d.nosugar}" data-view="radar">

<img src="${d.image}">

<div class="title">${d.name}</div>

<div class="price">${d.price}€</div>

<div class="rating"><span class="rating-label">Общая оценка:</span> ${stars(rating)}</div>

<button class="viewToggle" onclick="toggleView(this)">⭐ рейтинг</button>

<div class="details">

${metricsStars}

${radarMetrics}

<div class="boolean ${d.nosugar ? "true" : "false"}">
без сахара ${d.nosugar ? "✔" : "❌"}
</div>

<canvas class="radar" id="chart${i}" height="200"></canvas>

<button class="review-btn" onclick="window.location.href='reviews.html?id=${d.id}'">Отзывы</button>

</div>

</div>

`;
}

// Handle hover to prevent multiple cards from scaling
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      cards.forEach((c) => c.classList.remove("hovered"));
      card.classList.add("hovered");
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("hovered");
    });
  });
});

document.getElementById("search").addEventListener("input", updateView);
document.getElementById("sort").addEventListener("change", updateView);
document.getElementById("sugarFilter").addEventListener("change", updateView);

function toggleView(btn) {
  let card = btn.closest(".card");
  let current = card.dataset.view;
  let newView = current === "radar" ? "stars" : "radar";
  card.dataset.view = newView;
  btn.textContent = newView === "radar" ? "⭐ рейтинг" : "📊 диаграмма";
}

function render(list) {
  console.log("Rendering", list.length, "drinks");
  grid.innerHTML = "";

  list.forEach((d, i) => {
    grid.innerHTML += card(d, i);
  });

  // Setup hovers after rendering - each card manages its own hover
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      document
        .querySelectorAll(".card")
        .forEach((c) => c.classList.remove("hovered"));
      this.classList.add("hovered");
    });
    card.addEventListener("mouseleave", function () {
      this.classList.remove("hovered");
    });
  });

  list.forEach((d, i) => {
    new Chart(document.getElementById("chart" + i), {
      type: "radar",

      data: {
        labels: [
          "кислота",
          "сладость",
          "газированность",
          "концентрация",
          "послевкусие",
          "энергия",
          "цена",
        ],

        datasets: [
          {
            data: d.scores.map((s) => Math.round(s)),
            borderColor: "#ffffff",
            backgroundColor: "rgba(255,255,255,.35)",
          },
        ],
      },

      options: {
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 5,
            pointLabels: {
              color: "white",
              font: { size: 16 },
            },
          },
        },
      },
    });
  });
}

// Handle hover to prevent multiple cards from scaling
document.addEventListener("DOMContentLoaded", () => {
  // Removed global hover listeners, handled per card in render
});
