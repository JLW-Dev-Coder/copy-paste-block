(function () {
  "use strict";

  function showToast(toastEl, msg, type) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = "copy-paste-block-toast show" + (type ? " " + type : "");
    setTimeout(function () {
      toastEl.className = "copy-paste-block-toast" + (type ? " " + type : "");
    }, 1500);
  }

  function looksResolved(text) {
    return !!text && text.indexOf("{") === -1 && text.indexOf("}") === -1 && text.indexOf("$") === -1;
  }

  function initOne(container) {
    var memberEl = container.querySelector("#memberId");
    var valueEl  = memberEl || container.querySelector(".copy-paste-block-passkey") || document.getElementById("passkey");
    var btnEl    = container.querySelector(".copy-paste-block-btn") || document.getElementById("copyBtn");
    var toastEl  = container.querySelector(".copy-paste-block-toast") || document.getElementById("copyToast");
    if (!btnEl || !valueEl) return;

    function getValue() { return (valueEl.textContent || "").trim(); }

    function doCopy() {
      var text = getValue();
      if (!looksResolved(text)) {
        showToast(toastEl, "ID not available yet. Try again shortly.", "error");
        return;
      }

      function fallback() {
        try {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.top = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          ta.setSelectionRange(0, ta.value.length);
          document.execCommand("copy");
          document.body.removeChild(ta);
          showToast(toastEl, "Copied!", "success");
        } catch (e) {
          window.prompt("Copy:", text);
          showToast(toastEl, "Copy manually from the prompt.", "error");
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast(toastEl, "Copied!", "success");
        }).catch(fallback);
      } else {
        fallback();
      }
    }

    function updateDisabled() {
      btnEl.disabled = !looksResolved(getValue());
    }

    btnEl.addEventListener("click", doCopy);
    updateDisabled();

    var mo = new MutationObserver(updateDisabled);
    mo.observe(valueEl, { childList: true, characterData: true, subtree: true });
  }

  function initAll() {
    var blocks = document.querySelectorAll(".copy-paste-block");
    if (blocks.length) blocks.forEach(initOne);
    else initOne(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.CopyPasteBlock = { init: function (rootEl) { rootEl ? initOne(rootEl) : initAll(); } };

  (function () {
    function kick(root) {
      if (window.CopyPasteBlock) window.CopyPasteBlock.init(root || document);
    }
    kick();
    setTimeout(kick, 600);
    setTimeout(kick, 1500);

    var root = document.querySelector(".copy-paste-block") || document;
    var mo = new MutationObserver(function () { kick(root); });
    mo.observe(root, { childList: true, subtree: true });

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) setTimeout(kick, 300);
    });
  })();
})();

/* FAQ (SuiteDash-safe): hard-bind + delegated capture + aria sync */
(function () {
  "use strict";

  var ROOT_SEL = "[data-faq]";
  var BTN_SEL = "[data-faq-toggle]";

  function getRoot(btn) {
    if (!btn) return null;
    if (btn.closest) return btn.closest(ROOT_SEL);
    var el = btn;
    while (el && el !== document) {
      if (el.matches && el.matches(ROOT_SEL)) return el;
      el = el.parentNode;
    }
    return null;
  }

  function setAria(btn, isOpen) {
    try { btn.setAttribute("aria-expanded", isOpen ? "true" : "false"); } catch (e) {}
  }

  function doToggle(btn) {
    var root = getRoot(btn);
    if (!root) return;

    var isOpen = root.classList.toggle("is-open");
    setAria(btn, isOpen);
  }

  function stop(e) {
    try { e.preventDefault(); } catch (e2) {}
    try { e.stopPropagation(); } catch (e2) {}
    try { if (e.stopImmediatePropagation) e.stopImmediatePropagation(); } catch (e2) {}
  }

  function handler(e) {
    var t = e.target;
    var btn = (t && t.closest) ? t.closest(BTN_SEL) : null;
    if (!btn) return;

    stop(e);
    doToggle(btn);
  }

  function syncAria() {
    var btns = document.querySelectorAll(BTN_SEL);
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var root = getRoot(btn);
      if (!root) continue;
      setAria(btn, root.classList.contains("is-open"));
    }
  }

  function bind() {
    if (window.__pdFaq2Bound) return;
    window.__pdFaq2Bound = true;

    /* capture phase + non-passive so preventDefault sticks */
    document.addEventListener("click", handler, { capture: true, passive: false });
    document.addEventListener("mousedown", handler, { capture: true, passive: false });
    document.addEventListener("touchend", handler, { capture: true, passive: false });
    document.addEventListener("pointerup", handler, { capture: true, passive: false });
  }

  function boot() {
    bind();
    syncAria();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  /* SD re-renders blocks; resync */
  setTimeout(boot, 250);
  setTimeout(boot, 900);
  setTimeout(boot, 1600);

  new MutationObserver(function () { boot(); }).observe(document.body, { childList: true, subtree: true });
})();
