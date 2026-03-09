const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const container = document.getElementById("reviews");

let reviews = JSON.parse(localStorage.getItem("reviews")) || {};

if (!reviews[id]) reviews[id] = [];

render();

function render() {
  container.innerHTML = "";

  reviews[id].forEach((r, i) => {
    let div = document.createElement("div");

    div.innerHTML = `

<p>${r.text}</p>

<p>${r.rating}⭐</p>

<button onclick="removeReview(${i})">удалить</button>

`;

    container.appendChild(div);
  });

  save();
}

document.getElementById("add").onclick = function () {
  let text = document.getElementById("text").value;

  let rating = document.getElementById("rating").value;

  reviews[id].push({
    text: text,
    rating: rating,
    editable: true,
  });

  render();
};

function removeReview(i) {
  reviews[id].splice(i, 1);

  render();
}

function save() {
  localStorage.setItem("reviews", JSON.stringify(reviews));
}
