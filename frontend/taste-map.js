const API_LIST = "/api/energy-drinks/";

let drinks = [];

fetch(API_LIST)
  .then((r) => {
    if (!r.ok) return r.text().then((t) => { throw new Error(t || r.statusText); });
    return r.json();
  })
  .then((data) => {
    drinks = Array.isArray(data) ? data : [];
    tasteMap();
  })
  .catch((err) => {
    const ctx = document.getElementById("tasteMap");
    if (ctx && ctx.parentElement) {
      ctx.parentElement.innerHTML = `<p class="catalog-error">Не удалось загрузить данные: ${String(
        err.message || err
      )}</p>`;
    }
  });

function tasteMap() {
  const ctx = document.getElementById("tasteMap");
  if (!ctx || drinks.length === 0) {
    if (ctx && ctx.parentElement && drinks.length === 0) {
      ctx.parentElement.innerHTML =
        '<p class="catalog-error">В базе пока нет напитков для карты.</p>';
    }
    return;
  }

  const chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: drinks.map((d, i) => ({
        label: d.name,
        data: [{ x: d.sweetness, y: d.acidity }],
        pointRadius: 8,
        pointHoverRadius: 12,
        backgroundColor: `hsl(${(i * 360) / drinks.length}, 70%, 50%)`,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0,
      },
      plugins: {
        title: { display: false },
        legend: {
          display: true,
          labels: {
            color: "white",
            font: { size: 14 },
            usePointStyle: true,
          },
          onHover: (event, legendItem) => {
            const index = legendItem.datasetIndex;
            chart.data.datasets.forEach((ds, i) => {
              ds.pointRadius = i === index ? 16 : 8;
            });
            chart.update("none");
          },
          onLeave: () => {
            chart.data.datasets.forEach((ds) => (ds.pointRadius = 8));
            chart.update("none");
          },
        },
      },
      scales: {
        x: {
          min: 1,
          max: 5,
          title: { display: true, text: "сладость", color: "white" },
          grid: { color: "rgba(255,255,255,0.3)" },
          ticks: { color: "white", stepSize: 1 },
        },
        y: {
          min: 1,
          max: 5,
          title: { display: true, text: "кислота", color: "white" },
          grid: { color: "rgba(255,255,255,0.3)" },
          ticks: { color: "white", stepSize: 1 },
        },
      },
    },
  });
}
