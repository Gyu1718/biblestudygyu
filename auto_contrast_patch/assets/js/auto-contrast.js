(function () {
  "use strict";

  if (window.AutoContrast && window.AutoContrast.version) {
    window.AutoContrast.refresh();
    return;
  }

  var root = document.documentElement;
  var LIGHT = [248, 247, 242];
  var DARK = [23, 27, 34];
  var probe = null;
  var lastSignature = "";
  var scheduled = false;

  function ensureProbe() {
    if (probe) return probe;
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;visibility:hidden";
    (document.body || document.documentElement).appendChild(probe);
    return probe;
  }

  function parseColor(value, fallback) {
    if (!value || value === "transparent") return fallback || null;
    var el = ensureProbe();
    el.style.backgroundColor = "";
    el.style.backgroundColor = value;
    var resolved = getComputedStyle(el).backgroundColor;
    var match = resolved.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?\s*\)/i);
    if (!match) return fallback || null;
    var alpha = match[4] == null ? 1 : Number(match[4]);
    if (alpha <= 0) return fallback || null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }

  function cssVar(name, fallbackName) {
    var styles = getComputedStyle(root);
    var value = styles.getPropertyValue(name).trim();
    if (!value && fallbackName) value = styles.getPropertyValue(fallbackName).trim();
    return value;
  }

  function channel(value) {
    value /= 255;
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  }

  function ratio(a, b) {
    var la = luminance(a);
    var lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function chooseForeground(background) {
    return ratio(LIGHT, background) >= ratio(DARK, background) ? LIGHT : DARK;
  }

  function mix(a, b, amount) {
    return [
      Math.round(a[0] * (1 - amount) + b[0] * amount),
      Math.round(a[1] * (1 - amount) + b[1] * amount),
      Math.round(a[2] * (1 - amount) + b[2] * amount)
    ];
  }

  function accessibleSoft(foreground, background) {
    var low = 0;
    var high = 0.72;
    var best = foreground;
    for (var i = 0; i < 14; i++) {
      var middle = (low + high) / 2;
      var candidate = mix(foreground, background, middle);
      if (ratio(candidate, background) >= 4.5) {
        best = candidate;
        low = middle;
      } else {
        high = middle;
      }
    }
    return best;
  }

  function rgb(rgbValue) {
    return "rgb(" + rgbValue.map(function (value) { return Math.max(0, Math.min(255, Math.round(value))); }).join(" ") + ")";
  }

  function surface(name, variable, fallbackVariable) {
    var fallback = parseColor(cssVar("--paper"), [247, 246, 241]);
    var background = parseColor(cssVar(variable, fallbackVariable), fallback);
    var foreground = chooseForeground(background);
    var soft = accessibleSoft(foreground, background);
    root.style.setProperty("--on-" + name, rgb(foreground));
    root.style.setProperty("--on-" + name + "-soft", rgb(soft));
    root.style.setProperty("--" + name + "-resolved", rgb(background));
    return { background: background, foreground: foreground, soft: soft };
  }

  function resolveElementBackground(element) {
    var current = element;
    while (current && current !== document.documentElement) {
      var style = getComputedStyle(current);
      var color = parseColor(style.backgroundColor);
      if (color) return color;
      current = current.parentElement;
    }
    return parseColor(getComputedStyle(document.body || root).backgroundColor, [247, 246, 241]);
  }

  function updateOptInElements() {
    document.querySelectorAll("[data-auto-contrast]").forEach(function (element) {
      var background = resolveElementBackground(element);
      var foreground = chooseForeground(background);
      element.style.setProperty("--auto-contrast-ink", rgb(foreground));
      element.style.setProperty("--auto-contrast-soft", rgb(accessibleSoft(foreground, background)));
    });
  }

  function signature() {
    return [
      root.getAttribute("data-theme") || "auto",
      cssVar("--paper"), cssVar("--card"), cssVar("--panel"), cssVar("--band"),
      cssVar("--lapis"), cssVar("--lapis-deep"), cssVar("--deep"), cssVar("--ochre")
    ].join("|");
  }

  function refresh(force) {
    scheduled = false;
    var nextSignature = signature();
    if (!force && nextSignature === lastSignature) {
      updateOptInElements();
      return;
    }
    lastSignature = nextSignature;

    var page = surface("paper", "--paper");
    surface("card", "--card", "--panel");
    surface("panel", "--panel", "--card");
    surface("band", "--band", "--paper");
    surface("lapis", "--lapis", "--lapis-deep");
    surface("lapis-deep", "--lapis-deep", "--deep");
    surface("deep", "--deep", "--lapis-deep");
    surface("ochre", "--ochre", "--ochre-soft");

    /* 기존 페이지가 사용하는 공통 변수도 실제 페이지 배경에 맞춰 보정한다. */
    root.style.setProperty("--ink", rgb(page.foreground));
    root.style.setProperty("--ink-soft", rgb(page.soft));
    root.style.setProperty("--soft", rgb(page.soft));

    updateOptInElements();
    root.dataset.contrastReady = "true";
  }

  function schedule(force) {
    if (scheduled && !force) return;
    scheduled = true;
    requestAnimationFrame(function () { refresh(Boolean(force)); });
  }

  var observer = new MutationObserver(function (records) {
    var needsRefresh = records.some(function (record) {
      return record.type === "childList" || record.attributeName === "data-theme" || record.attributeName === "class";
    });
    if (needsRefresh) schedule(false);
  });

  function boot() {
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    var media = matchMedia("(prefers-color-scheme: dark)");
    if (media.addEventListener) media.addEventListener("change", function () { schedule(true); });
    else if (media.addListener) media.addListener(function () { schedule(true); });
    window.addEventListener("scriptorium:themechange", function () { schedule(true); });
    window.addEventListener("pageshow", function () { schedule(true); });
    setInterval(function () {
      if (signature() !== lastSignature) schedule(true);
    }, 1200);
    schedule(true);
  }

  window.AutoContrast = {
    version: "1.0.0",
    refresh: function () { schedule(true); },
    contrastRatio: ratio
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
