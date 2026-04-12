const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

function resolveIndexPath() {
  const candidates = ["index.html", "Index.html"];
  for (const name of candidates) {
    const full = path.join(__dirname, name);
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return path.join(__dirname, "index.html");
}

app.get("/", (req, res) => {
  res.sendFile(resolveIndexPath());
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Start the server (0.0.0.0 — доступ из Docker-сети)
app.listen(port, "0.0.0.0", () => {
  console.log(`Frontend app listening at http://localhost:${port}`);
});
