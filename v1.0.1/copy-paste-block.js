/* v1.0.1 – always-enabled button + event delegation */
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

  function getContainer(el) {
    return el.closest(".copy-paste-block") || document;
  }

  function getEls(container) {
    return {
      valueEl: container.querySelector(".copy-paste-block-passkey") || document.getElementById("passkey"),
      toastEl: container.querySelector(".copy-paste-block-toast")   || document.getElementById("copyToast")
    };
  }

  function tryCopy(container) {
    var els = getEls(container);
    if (!els.valueEl) return;
    var text = (els.valueEl.textContent || "").trim();

    if (!looksResolved(text)) {
      showToast(els.toastEl, "Code not available yet. Try again shortly.", "error");
      return;
    }

    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", "");
        ta.style.position = "fixed"; ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.select(); ta.setSelectionRange(0, ta.value.length);
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast(els.toastEl, "Code copied to clipboard!", "success");
      } catch (e) {
        window.prompt("Copy your code:", text);
        showToast(els.toastEl, "Copy manually from the prompt.", "error");
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(els.toastEl, "Code copied to clipboard!", "success");
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  // Event delegation: survives SuiteDash re-renders
  document.addEventListener("click", function (evt) {
    var btn = evt.target.closest(".copy-paste-block-btn, #copyBtn");
    if (!btn) return;
    btn.removeAttribute("disabled"); // ensure clickable if SuiteDash re-adds disabled
    tryCopy(getContainer(btn));
  });

  // Make sure any existing buttons aren’t disabled (initial pass + retries)
  function undisableAll() {
    document.querySelectorAll(".copy-paste-block-btn, #copyBtn").forEach(function (b) {
      b.removeAttribute("disabled");
    });
  }
  undisableAll();
  setTimeout(undisableAll, 400);
  setTimeout(undisableAll, 1200);

  // Keep API compatibility (manual init just undisables)
  window.CopyPasteBlock = { init: function () { undisableAll(); } };
})();
