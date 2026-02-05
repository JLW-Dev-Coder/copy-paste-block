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
(function () {
  "use strict";

  function toggleFrom(target) {
    var label = target.closest(".pd-faq2-label");
    if (!label) return;

    var item = label.closest(".pd-faq2-item");
    if (!item) return;

    item.classList.toggle("is-open");
  }

  function bindOnce() {
    if (document.__pdFaq2Bound) return;
    document.__pdFaq2Bound = true;

    document.addEventListener("click", function (e) {
      toggleFrom(e.target);
    }, true);
  }

  function kick() {
    bindOnce();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", kick);
  } else {
    kick();
  }

  setTimeout(kick, 600);
  setTimeout(kick, 1500);

  var mo = new MutationObserver(kick);
  mo.observe(document.body, { childList: true, subtree: true });
})();
