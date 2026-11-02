(function () {
  // ---------- Language ----------
  var UK = window.I18N_UK || {};
  var EN = {};
  var textNodes = document.querySelectorAll("[data-i18n]");
  var attrNodes = document.querySelectorAll("[data-i18n-attr]");

  // Remember the English markup so we can switch back without a reload.
  textNodes.forEach(function (el) { EN[el.dataset.i18n] = el.innerHTML; });
  attrNodes.forEach(function (el) {
    el.dataset.i18nAttr.split(";").forEach(function (pair) {
      var p = pair.split(":");
      EN[p[1]] = EN[p[1]] || el.getAttribute(p[0]);
    });
  });
  EN.copy = "Copy";
  EN.copied = "Copied";

  var current = "en";
  function t(key) {
    var dict = current === "uk" ? UK : EN;
    return dict[key] != null ? dict[key] : EN[key];
  }

  function setLang(lang) {
    current = lang === "uk" ? "uk" : "en";
    document.documentElement.lang = current;
    textNodes.forEach(function (el) { el.innerHTML = t(el.dataset.i18n); });
    attrNodes.forEach(function (el) {
      el.dataset.i18nAttr.split(";").forEach(function (pair) {
        var p = pair.split(":");
        el.setAttribute(p[0], t(p[1]));
      });
    });
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === current));
    });
    try { localStorage.setItem("lang", current); } catch (e) {}
    var url = new URL(location.href);
    if (current === "uk") url.searchParams.set("lang", "uk"); else url.searchParams.delete("lang");
    history.replaceState(null, "", url);
  }

  document.querySelectorAll(".lang-switch button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });

  var initial = new URLSearchParams(location.search).get("lang");
  if (!initial) { try { initial = localStorage.getItem("lang"); } catch (e) {} }
  if (initial === "uk" || initial === "ua") setLang("uk");

  // ---------- Copy buttons ----------
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.dataset.copy;
      var done = function () {
        btn.textContent = t("copied");
        btn.classList.add("is-copied");
        setTimeout(function () { btn.textContent = t("copy"); btn.classList.remove("is-copied"); }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = value; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  // ---------- Lightbox ----------
  var dialog = document.querySelector(".lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("img");
  var group = [], index = 0;

  function show(i) {
    index = (i + group.length) % group.length;
    var link = group[index];
    var thumb = link.querySelector("img");
    img.src = link.getAttribute("href");
    img.alt = thumb ? thumb.alt : "";
    var multi = group.length > 1;
    dialog.querySelector(".lb-prev").hidden = !multi;
    dialog.querySelector(".lb-next").hidden = !multi;
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      group = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox="' + link.dataset.lightbox + '"]'));
      show(group.indexOf(link));
      dialog.showModal();
    });
  });

  dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
  dialog.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
  dialog.addEventListener("close", function () { img.removeAttribute("src"); });
})();
