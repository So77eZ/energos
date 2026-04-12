(function () {
  window.DrinkModel = {
    scores(d) {
      return [
        Number(d.acidity),
        Number(d.sweetness),
        Number(d.carbonation),
        Number(d.concentration),
        Number(d.aftertaste),
        Number(d.price_quality),
      ];
    },
    imageUrl(d) {
      return d && d.image_url ? String(d.image_url) : "";
    },
  };
})();
