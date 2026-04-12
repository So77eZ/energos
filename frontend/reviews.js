const API_LIST = "/api/energy-drinks/";

const params = new URLSearchParams(window.location.search);

let id = params.get("id");

const container = document.getElementById("reviews");

let reviews = JSON.parse(localStorage.getItem("reviews")) || {};

let drinks = [];

let drink;

const priceLabel = [
  "",
  "Очень дешево",
  "Дешево",
  "Нормально",
  "Дорого",
  "Для богатых",
];

function priceLabelFromScore(v) {
  const i = Math.round(Number(v));
  if (i < 1 || i > 5) return "—";
  return priceLabel[i] || "—";
}

/** Приводит сохранённые отзывы к 6 критериям (старый формат с «энергией»). */
function normalizeScores(scores) {
  if (!scores || !scores.length) {
    return [3, 3, 3, 3, 3, 3];
  }
  if (scores.length >= 6) {
    return scores.slice(0, 6).map((x) => Number(x) || 0);
  }
  if (scores.length === 7) {
    return [
      Number(scores[0]) || 0,
      Number(scores[1]) || 0,
      Number(scores[2]) || 0,
      Number(scores[3]) || 0,
      Number(scores[4]) || 0,
      Number(scores[6]) || 0,
    ];
  }
  const pad = [3, 3, 3, 3, 3, 3];
  for (let i = 0; i < scores.length && i < 6; i++) {
    pad[i] = Number(scores[i]) || 3;
  }
  return pad;
}

function ensureReviewBucket(key) {
  if (!reviews[key]) reviews[key] = [];
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
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

function updateDrinkInfo() {
  if (!drink) return;

  const scores = DrinkModel.scores(drink);

  document.getElementById("drinkNameAbove").textContent = drink.name;
  const img = document.getElementById("drinkImage");
  const url = DrinkModel.imageUrl(drink);
  if (url) {
    img.src = url;
    img.style.display = "";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }

  const key = String(id);
  let currentIndex = drinks.findIndex((d) => String(d.id) === key);
  if (currentIndex < 0) currentIndex = 0;
  if (drinks.length === 0) {
    document.getElementById("prevPreview").innerHTML = "";
    document.getElementById("nextPreview").innerHTML = "";
  } else {
    let prevIndex = (currentIndex - 1 + drinks.length) % drinks.length;
    let nextIndex = (currentIndex + 1) % drinks.length;
    const prevUrl = DrinkModel.imageUrl(drinks[prevIndex]);
    const nextUrl = DrinkModel.imageUrl(drinks[nextIndex]);
    document.getElementById("prevPreview").innerHTML = prevUrl
      ? `<img src="${prevUrl}" style="width:60px; height:60px; object-fit:contain;" alt="" />`
      : "";
    document.getElementById("nextPreview").innerHTML = nextUrl
      ? `<img src="${nextUrl}" style="width:60px; height:60px; object-fit:contain;" alt="" />`
      : "";
  }

  document.getElementById("adminRating").innerHTML = `
    <div class="admin-review">
      <h4>Оценка админа:</h4>
      <p>Общая: ${stars(avg(scores))}</p>
      <p>Кислота: ${stars(scores[0])}</p>
      <p>Сладость: ${stars(scores[1])}</p>
      <p>Газированность: ${stars(scores[2])}</p>
      <p>Концентрация: ${stars(scores[3])}</p>
      <p>Послевкусие: ${stars(scores[4])}</p>
      <p>Цена/качество: ${stars(scores[5])} (${priceLabelFromScore(
    scores[5]
  )})</p>
    </div>
  `;

  ensureReviewBucket(key);

  if (reviews[key] && reviews[key].length > 0) {
    let userAvgs = reviews[key]
      .map((r) => parseFloat(r.rating))
      .filter((v) => !isNaN(v));
    if (userAvgs.length > 0) {
      let userAvg = userAvgs.reduce((a, b) => a + b, 0) / userAvgs.length;
      let allScores = [0, 0, 0, 0, 0, 0];
      reviews[key].forEach((r) => {
        const ns = normalizeScores(r.scores);
        for (let i = 0; i < 6; i++) {
          allScores[i] += ns[i];
        }
      });
      allScores = allScores.map((s) => s / reviews[key].length);

      document.getElementById("userRating").innerHTML = `
        <div class="user-review">
          <h4>Средняя оценка пользователей (${reviews[key].length}):</h4>
          <p>Общая: ${stars(userAvg)}</p>
          <p>Кислота: ${stars(allScores[0])}</p>
          <p>Сладость: ${stars(allScores[1])}</p>
          <p>Газированность: ${stars(allScores[2])}</p>
          <p>Концентрация: ${stars(allScores[3])}</p>
          <p>Послевкусие: ${stars(allScores[4])}</p>
          <p>Цена/качество: ${stars(allScores[5])} (${priceLabelFromScore(
            allScores[5]
          )})</p>
        </div>
      `;
    } else {
      document.getElementById("userRating").innerHTML =
        `<p>Нет валидных оценок</p>`;
    }
  } else {
    document.getElementById("userRating").innerHTML =
      `<p>Пользовательских отзывов нет</p>`;
  }
}

function render() {
  container.innerHTML = "";

  const key = String(id);
  ensureReviewBucket(key);

  if (reviews[key].length === 0) {
    container.innerHTML = "<p>Пока нет отзывов. Будьте первым!</p>";
    return;
  }

  const reviewsGrid = document.createElement("div");
  reviewsGrid.className = "reviews-grid";

  reviews[key].forEach((r, i) => {
    let div = document.createElement("div");
    div.className = "review-card";

    const ns = normalizeScores(r.scores);
    let starsHtml = `
      <p>Кислота: ${stars(ns[0])}</p>
      <p>Сладость: ${stars(ns[1])}</p>
      <p>Газированность: ${stars(ns[2])}</p>
      <p>Концентрация: ${stars(ns[3])}</p>
      <p>Послевкусие: ${stars(ns[4])}</p>
      <p>Цена/качество: ${stars(ns[5])} (${priceLabelFromScore(ns[5])})</p>
    `;

    div.innerHTML = `
      <p><strong>${r.username}</strong></p>
      <p>Рейтинг: ${r.rating}⭐ (${r.date})</p>
      <p>${r.text}</p>
      <div class="review-criteria">${starsHtml}</div>
      <button onclick="removeReview(${i})">Удалить</button>
    `;

    reviewsGrid.appendChild(div);
  });

  container.appendChild(reviewsGrid);
  save();
}

async function init() {
  const res = await fetch(API_LIST);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  drinks = await res.json();

  if (!drinks.length) {
    document.getElementById("drinkNameAbove").textContent =
      "Нет напитков в базе";
    document.getElementById("drinkImage").style.display = "none";
    document.getElementById("adminRating").innerHTML = "";
    document.getElementById("userRating").innerHTML = "";
    document.getElementById("prevPreview").innerHTML = "";
    document.getElementById("nextPreview").innerHTML = "";
    container.innerHTML =
      "<p class=\"catalog-error\">Добавьте напитки в разделе «Управление».</p>";
    return;
  }

  if (!id && drinks.length > 0) {
    id = String(drinks[0].id);
    window.history.replaceState(
      null,
      "",
      `reviews.html?id=${encodeURIComponent(id)}`
    );
  }

  if (id) {
    ensureReviewBucket(String(id));
    drink = drinks.find((d) => String(d.id) === String(id));
    if (!drink && /^\d+$/.test(String(id))) {
      const one = await fetch(`/api/energy-drinks/${id}/`);
      if (one.ok) {
        drink = await one.json();
        if (!drinks.some((d) => String(d.id) === String(drink.id))) {
          drinks.push(drink);
        }
      }
    }
    if (drink) {
      updateDrinkInfo();
    } else {
      document.getElementById("drinkNameAbove").textContent =
        "Напиток не найден";
      document.getElementById("drinkImage").style.display = "none";
      document.getElementById("adminRating").innerHTML = "";
      document.getElementById("userRating").innerHTML = "";
    }
  }

  render();
}

document.getElementById("prevDrink").addEventListener("click", () => {
  if (!drinks.length) return;
  const key = String(id);
  let currentIndex = drinks.findIndex((d) => String(d.id) === key);
  if (currentIndex < 0) currentIndex = 0;
  let prevIndex = (currentIndex - 1 + drinks.length) % drinks.length;
  window.location.href = `reviews.html?id=${encodeURIComponent(
    String(drinks[prevIndex].id)
  )}`;
});

document.getElementById("nextDrink").addEventListener("click", () => {
  if (!drinks.length) return;
  const key = String(id);
  let currentIndex = drinks.findIndex((d) => String(d.id) === key);
  if (currentIndex < 0) currentIndex = 0;
  let nextIndex = (currentIndex + 1) % drinks.length;
  window.location.href = `reviews.html?id=${encodeURIComponent(
    String(drinks[nextIndex].id)
  )}`;
});

init().catch((e) => {
  container.innerHTML = `<p class="catalog-error">Не удалось загрузить напитки: ${String(
    e.message || e
  )}</p>`;
});

document.getElementById("reviewForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (id == null || id === "" || !drink) {
    alert("Сначала выберите напиток (нужны данные в базе).");
    return;
  }
  const key = String(id);
  ensureReviewBucket(key);

  let formData = new FormData(e.target);
  let username = formData.get("username") || "Аноним";
  let text = formData.get("text");
  let rating = formData.get("overallRating");
  let scores = [];
  for (let i = 0; i < 6; i++) {
    scores.push(parseFloat(formData.get(`scores[${i}]`)));
  }

  reviews[key].push({
    username: username,
    text: text,
    rating: rating,
    scores: scores,
    date: new Date().toLocaleString(),
    editable: true,
  });

  updateDrinkInfo();
  render();
  e.target.reset();
  document
    .querySelectorAll('input[name^="scores"]')
    .forEach((inp) => (inp.value = 3));
  const sel = document.querySelector('select[name="scores[5]"]');
  if (sel) sel.value = "3";
  document.getElementById("overallRating").value = 3;
});

function removeReview(i) {
  const key = String(id);
  reviews[key].splice(i, 1);
  render();
}

function save() {
  localStorage.setItem("reviews", JSON.stringify(reviews));
}
