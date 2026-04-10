const params = new URLSearchParams(window.location.search);

let id = params.get("id");

const container = document.getElementById("reviews");

let reviews = JSON.parse(localStorage.getItem("reviews")) || {};

let drinks = [];

if (!reviews[id]) reviews[id] = [];

let drink;

fetch("drinks.json")
  .then((r) => r.json())
  .then((data) => {
    drinks = data;
    if (!id) {
      let randomIndex = Math.floor(Math.random() * drinks.length);
      id = drinks[randomIndex].id;
    }
    drink = data.find((d) => d.id === id);
    if (drink) {
      updateDrinkInfo();
    }
    render();
  });

function updateDrinkInfo() {
  document.getElementById("drinkNameAbove").textContent = drink.name;
  document.getElementById("drinkImage").src = drink.image;

  // Update previews
  let currentIndex = drinks.findIndex((d) => d.id === id);
  let prevIndex = (currentIndex - 1 + drinks.length) % drinks.length;
  let nextIndex = (currentIndex + 1) % drinks.length;

  document.getElementById("prevPreview").innerHTML =
    `<img src="${drinks[prevIndex].image}" style="width:60px; height:60px; object-fit:contain;">`;
  document.getElementById("nextPreview").innerHTML =
    `<img src="${drinks[nextIndex].image}" style="width:60px; height:60px; object-fit:contain;">`;

  // Admin rating
  let priceLabel = [
    "",
    "Очень дешево",
    "Дешево",
    "Нормально",
    "Дорого",
    "Для богатых",
  ];
  document.getElementById("adminRating").innerHTML = `
    <div class="admin-review">
      <h4>Оценка админа:</h4>
      <p>Общая: ${stars(avg(drink.scores))}</p>
      <p>Кислота: ${stars(drink.scores[0])}</p>
      <p>Сладость: ${stars(drink.scores[1])}</p>
      <p>Газированность: ${stars(drink.scores[2])}</p>
      <p>Концентрация: ${stars(drink.scores[3])}</p>
      <p>Послевкусие: ${stars(drink.scores[4])}</p>
      <p>Энергия: ${stars(drink.scores[5])}</p>
      <p>Цена: ${priceLabel[Math.round(drink.scores[6])]}</p>
    </div>
  `;

  // User rating
  if (reviews[id] && reviews[id].length > 0) {
    let userAvgs = reviews[id]
      .map((r) => parseFloat(r.rating))
      .filter((v) => !isNaN(v));
    if (userAvgs.length > 0) {
      let userAvg = userAvgs.reduce((a, b) => a + b) / userAvgs.length;
      let allScores = [0, 0, 0, 0, 0, 0, 0];
      reviews[id].forEach((r) => {
        for (let i = 0; i < 7; i++) {
          allScores[i] += parseFloat(r.scores[i]) || 0;
        }
      });
      allScores = allScores.map((s) => s / reviews[id].length);

      document.getElementById("userRating").innerHTML = `
        <div class="user-review">
          <h4>Средняя оценка пользователей (${reviews[id].length}):</h4>
          <p>Общая: ${stars(userAvg)}</p>
          <p>Кислота: ${stars(allScores[0])}</p>
          <p>Сладость: ${stars(allScores[1])}</p>
          <p>Газированность: ${stars(allScores[2])}</p>
          <p>Концентрация: ${stars(allScores[3])}</p>
          <p>Послевкусие: ${stars(allScores[4])}</p>
          <p>Энергия: ${stars(allScores[5])}</p>
          <p>Цена: ${priceLabel[Math.round(allScores[6])]}</p>
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

function avg(arr) {
  return arr.reduce((a, b) => a + b) / arr.length;
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

function render() {
  container.innerHTML = "";

  if (reviews[id].length === 0) {
    container.innerHTML = "<p>Пока нет отзывов. Будьте первым!</p>";
    return;
  }

  const reviewsGrid = document.createElement("div");
  reviewsGrid.className = "reviews-grid";

  reviews[id].forEach((r, i) => {
    let div = document.createElement("div");
    div.className = "review-card";

    let starsHtml = `
      <p>Кислота: ${stars(r.scores[0])}</p>
      <p>Сладость: ${stars(r.scores[1])}</p>
      <p>Газированность: ${stars(r.scores[2])}</p>
      <p>Концентрация: ${stars(r.scores[3])}</p>
      <p>Послевкусие: ${stars(r.scores[4])}</p>
      <p>Энергия: ${stars(r.scores[5])}</p>
      <p>Цена: ${["Очень дешево", "Дешево", "Нормально", "Дорого", "Для богатых"][Math.round(r.scores[6]) - 1]}</p>
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

function stars(v) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= Math.round(v) ? "⭐" : "☆";
  return s + " " + v.toFixed(1);
}

document.getElementById("reviewForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let formData = new FormData(e.target);
  let username = formData.get("username") || "Аноним";
  let text = formData.get("text");
  let rating = formData.get("overallRating");
  let scores = [];
  for (let i = 0; i < 7; i++) {
    scores.push(parseFloat(formData.get(`scores[${i}]`)));
  }

  reviews[id].push({
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
  // Reset to defaults
  document
    .querySelectorAll('input[name^="scores"]')
    .forEach((inp) => (inp.value = 3));
  document.getElementById("overallRating").value = 3;
});

function removeReview(i) {
  reviews[id].splice(i, 1);

  render();
}

function save() {
  localStorage.setItem("reviews", JSON.stringify(reviews));
}

// Navigation
document.getElementById("prevDrink").addEventListener("click", () => {
  let currentIndex = drinks.findIndex((d) => d.id === id);
  let prevIndex = (currentIndex - 1 + drinks.length) % drinks.length;
  window.location.href = `reviews.html?id=${drinks[prevIndex].id}`;
});

document.getElementById("nextDrink").addEventListener("click", () => {
  let currentIndex = drinks.findIndex((d) => d.id === id);
  let nextIndex = (currentIndex + 1) % drinks.length;
  window.location.href = `reviews.html?id=${drinks[nextIndex].id}`;
});
