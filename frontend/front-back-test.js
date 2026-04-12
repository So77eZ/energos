console.log("JS LOADED");

const API_URL = "/api/energy-drinks/";

// получить список
function loadDrinks() {
  console.log("LOADING DRINKS");

  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("list");
      list.innerHTML = "";

      data.forEach((drink) => {
        const li = document.createElement("li");
        li.textContent = `${drink.name} — ${drink.price}`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Удалить";
        delBtn.onclick = () => deleteDrink(drink.id);

        li.appendChild(delBtn);
        list.appendChild(li);
      });
    })
    .catch((err) => console.error("LOAD ERROR:", err));
}

// создать
function createDrink() {
  const name = document.getElementById("name").value.trim();

  if (!name) {
    alert("Введите название");
    return;
  }

  // числа с дефолтами (чтобы не было NaN)
  const now = new Date().toISOString();
  const price = Number(document.getElementById("price").value) || 0;
  const acidity = Number(document.getElementById("acidity").value) || 1;
  const sweetness = Number(document.getElementById("sweetness").value) || 1;
  const concentration =
    Number(document.getElementById("concentration").value) || 1;
  const carbonation = Number(document.getElementById("carbonation").value) || 1;
  const aftertaste = Number(document.getElementById("aftertaste").value) || 1;
  const price_quality =
    Number(document.getElementById("price_quality").value) || 1;

  const no_sugar = document.getElementById("no_sugar").checked;

  const payload = {
    name,
    price,
    image_url: "placeholder.jpg",
    acidity,
    sweetness,
    concentration,
    carbonation,
    aftertaste,
    price_quality,
    no_sugar,
    created_at: now,
    updated_at: now,
  };

  console.log("SENDING:", payload);

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        console.error("SERVER ERROR:", text);
        throw new Error("Ошибка создания");
      }
      return res.json();
    })
    .then(() => {
      loadDrinks();
    })
    .catch((err) => {
      console.error("CREATE ERROR:", err);
    });
}

// удалить
function deleteDrink(id) {
  fetch(`${API_URL}${id}/`, {
    method: "DELETE",
  })
    .then(() => loadDrinks())
    .catch((err) => console.error("DELETE ERROR:", err));
}

// старт
loadDrinks();
