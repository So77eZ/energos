let drinks = [];

fetch("drinks.json")
  .then((r) => r.json())
  .then((data) => {
    drinks = data;
    tasteMap();
  });

function tasteMap() {
  const ctx = document.getElementById("tasteMap");
  const chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: drinks.map((d, i) => ({
        label: d.name,
        data: [{ x: d.coords.sweet, y: d.coords.acid }],
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
          title: { display: true, text: "сладость", color: "white" },
          grid: { color: "rgba(255,255,255,0.3)" },
          ticks: { color: "white" },
        },
        y: {
          title: { display: true, text: "кислота", color: "white" },
          grid: { color: "rgba(255,255,255,0.3)" },
          ticks: { color: "white" },
        },
      },
    },
  });
}
