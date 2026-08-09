/* History data preloader.
   Adds Reformed tradition, neo-orthodox history, and neo-orthodox doctrine-history data before app.js starts. */
(function () {
  function loadJson(path, fallback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) return JSON.parse(xhr.responseText);
    } catch (error) {
      console.warn(path + " was not preloaded.", error);
    }
    return fallback;
  }

  if (!window.__DATA__) window.__DATA__ = {};
  var reformedHistory = loadJson("./data/tradition-history.json", []);
  var neoOrthodoxHistory = loadJson("./data/neo-orthodoxy-history.json", []);
  var neoOrthodoxDoctrineHistory = loadJson("./data/neo-orthodoxy-doctrine-history.json", []);
  window.__DATA__.history = [].concat(
    reformedHistory || [],
    neoOrthodoxHistory || [],
    neoOrthodoxDoctrineHistory || []
  );
})();
