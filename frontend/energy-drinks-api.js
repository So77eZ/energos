(function () {
  const BASE = "/api/energy-drinks";

  function url(id) {
    return `${BASE}/${id}/`;
  }

  async function parseError(res) {
    let text = await res.text();
    try {
      const j = JSON.parse(text);
      if (j.detail) {
        if (Array.isArray(j.detail)) {
          return j.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
        }
        return String(j.detail);
      }
    } catch (_) {
      /* ignore */
    }
    return text || res.statusText;
  }

  window.EnergyDrinksAPI = {
    async list() {
      const res = await fetch(`${BASE}/`);
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    },

    async get(id) {
      const res = await fetch(url(id));
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    },

    async create(body) {
      const res = await fetch(`${BASE}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    },

    async update(id, body) {
      const res = await fetch(url(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    },

    async remove(id) {
      const res = await fetch(url(id), { method: "DELETE" });
      if (!res.ok) throw new Error(await parseError(res));
      return res.json();
    },
  };
})();
