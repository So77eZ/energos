let drinks = [];

const grid = document.getElementById("grid");

fetch("drinks.json")
  .then((r) => r.json())
  .then((data) => {
    drinks = data;
    render(drinks);
    tasteMap();
  });

function avg(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
}

function stars(v) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= Math.round(v) ? "⭐" : "☆";

  return s + " " + v.toFixed(1);
}

function card(d, i) {
  let rating = avg(d.scores);

  return `

<div class="card" data-flavor="${d.flavor}" data-nosugar="${d.nosugar}">

<img src="${d.image}">

<div class="title">${d.name}</div>

<div class="price">${d.price}€</div>

<div class="rating">${stars(rating)}</div>

<div class="details">

<canvas class="radar" id="chart${i}" height="200"></canvas>

<div class="boolean ${d.nosugar ? "true" : "false"}">
без сахара ${d.nosugar ? "✔" : "❌"}
</div>

<a href="reviews.html?id=${d.id}">
отзывы
</a>

</div>

</div>

`;
}

function render(list) {
  grid.innerHTML = "";

  list.forEach((d, i) => {
    grid.innerHTML += card(d, i);
  });

  list.forEach((d, i) => {
    new Chart(document.getElementById("chart" + i), {
      type: "radar",

      data: {
        labels: [
          "кислота",
          "сладость",
          "газ",
          "концентрация",
          "послевкусие",
          "энергия",
          "ценность",
        ],

        datasets: [
          {
            data: d.scores,
            borderColor: "#00E5FF",
            backgroundColor: "rgba(0,229,255,.35)",
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
              font: { size: 16 },
            },
          },
        },
      },
    });
  });
}

document.getElementById("viewMode").addEventListener("change", (e) => {
  document.body.dataset.view = e.target.value;
});

function tasteMap() {
  new Chart(
    document.getElementById("tasteMap"),

    {
      type: "scatter",

      data: {
        datasets: drinks.map((d) => ({
          label: d.name,

          data: [
            {
              x: d.coords.sweet,
              y: d.coords.acid,
            },
          ],
        })),
      },

      options: {
        scales: {
          x: { title: { display: true, text: "сладость" } },
          y: { title: { display: true, text: "кислота" } },
        },
      },
    },
  );
}
