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

/* PROJECT DASHBAORD FAQ (canonical; SuiteDash-safe): event delegation + aria sync + mutation re-kick */
/* PROJECT DASHBOARD FAQ TOGGLE (SuiteDash-safe, no dependencies)
   - Works with ANY of these triggers:
     - .pd-faq2-label
     - .pd-faq2-toggle
     - [data-faq-toggle]
   - Toggles closest:
     - .pd-faq2-item
     - [data-faq]
*/
(function () {
  "use strict";

  function closest(el, selector) {
    while (el && el !== document) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentNode;
    }
    return null;
  }

  function setAria(btn, isOpen) {
    try { btn.setAttribute("aria-expanded", isOpen ? "true" : "false"); } catch (e) {}
  }

  function getTrigger(target) {
    return (
      target.closest && (
        target.closest(".pd-faq2-label") ||
        target.closest(".pd-faq2-toggle") ||
        target.closest("[data-faq-toggle]")
      )
    ) || null;
  }

  function getItem(trigger) {
    return (
      closest(trigger, ".pd-faq2-item") ||
      closest(trigger, "[data-faq]") ||
      null
    );
  }

  function toggleFromTarget(target) {
    var trigger = getTrigger(target);
    if (!trigger) return;

    var item = getItem(trigger);
    if (!item) return;

    /* Prevent SuiteDash / browser from stealing the click */
    try { if (typeof event !== "undefined") event.preventDefault(); } catch (e) {}

    var isOpen = item.classList.toggle("is-open");

    /* aria sync */
    if (trigger.matches && (trigger.matches(".pd-faq2-toggle") || trigger.matches("[data-faq-toggle]"))) {
      setAria(trigger, isOpen);
    } else {
      var btn = item.querySelector(".pd-faq2-toggle,[data-faq-toggle]");
      if (btn) setAria(btn, isOpen);
    }
  }

  function bindOnce() {
    if (document.__pdFaqAnyBound) return;
    document.__pdFaqAnyBound = true;

    document.addEventListener("click", function (e) {
      toggleFromTarget(e.target);
    }, true);

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var trigger = getTrigger(e.target);
      if (!trigger) return;
      e.preventDefault();
      toggleFromTarget(e.target);
    }, true);
  }

  function kick() {
    bindOnce();

    /* Make triggers clickable even if SD theme disables pointer events */
    var triggers = document.querySelectorAll(".pd-faq2-label,.pd-faq2-toggle,[data-faq-toggle]");
    triggers.forEach(function (t) {
      try { t.style.pointerEvents = "auto"; } catch (e) {}
      try { t.style.cursor = "pointer"; } catch (e) {}
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kick);
  else kick();

  setTimeout(kick, 250);
  setTimeout(kick, 800);
  setTimeout(kick, 1600);

  var mo = new MutationObserver(function () { kick(); });
  mo.observe(document.body, { childList: true, subtree: true });
})();
