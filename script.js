/* ============================================================
   Nalu Dining LP — script.js
   合同会社Nalu-09

   ここを変更すれば全体に反映されます:
   - IG_URL         … Instagramの相談リンク（サイト全体の data-ig-link に自動反映）
   - FORM_ENDPOINT  … 問い合わせフォームの送信先。未設定(null)の間はフォームを自動非表示。
   - LEGAL_LINKS    … プライバシーポリシー等のURL。未設定の間はリンクを押しても遷移せず案内のみ表示。
   ============================================================ */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. 設定値（後から差し替える場所）
     --------------------------------------------------------- */

  // ▼ Instagram URLを変更する場合はここを書き換えてください
  var IG_URL = "https://www.instagram.com/nalu.yuta?igsh=MWUxYmkxazNnb21raQ%3D%3D&utm_source=qr";

  // ▼ フォーム送信先。Formspree / Googleフォーム連携などのURLが決まったらここに設定すると
  //    フォームセクションが自動的に表示されます。null のままなら非表示のままです。
  var FORM_ENDPOINT = null; // 例: "https://formspree.io/f/xxxxxxx"

  // ▼ 法務ページURL。用意ができ次第、null を実際のURLに差し替えてください。
  var LEGAL_LINKS = {
    privacy: null,   // 例: "https://nalu-09.com/legal/privacy"
    terms: null,     // 例: "https://nalu-09.com/legal/terms"
    tokushoho: null  // 例: "https://nalu-09.com/legal/tokushoho"
  };

  /* ---------------------------------------------------------
     2. Instagramリンクの一括反映
     --------------------------------------------------------- */
  document.querySelectorAll("[data-ig-link]").forEach(function (el) {
    el.setAttribute("href", IG_URL);
  });

  /* ---------------------------------------------------------
     3. ヘッダー：スクロールで背景を切り替え
     --------------------------------------------------------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---------------------------------------------------------
     4. スクロールで要素をフェードイン表示
     --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(".reveal, .brush-divider");
  if ("IntersectionObserver" in window && revealTargets.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealTargets.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // 非対応ブラウザ・reduced motion環境では最初から表示
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* prefers-reduced-motion の場合は即時表示にする */
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------
     5. FAQ アコーディオン
     --------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var answer = item.querySelector(".faq-a");
    if (!btn || !answer) return;

    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      // ひとつ開いたら他は閉じる（読みやすさ優先。不要なら以下2行を削除可）
      document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-a").style.maxHeight = null;
          openItem.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        answer.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------------------------------------------------------
     6. 問い合わせフォーム：送信先が未設定の間は非表示のまま
     --------------------------------------------------------- */
  var formSection = document.getElementById("contact-form");
  var form = document.getElementById("inquiry-form");

  if (FORM_ENDPOINT && formSection && form) {
    formSection.style.display = "";
    form.setAttribute("action", FORM_ENDPOINT);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var statusEl = document.getElementById("form-status");
      var submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = "送信しています…";

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (res.ok) {
            if (statusEl) statusEl.textContent = "送信しました。ご連絡ありがとうございます。";
            form.reset();
          } else {
            if (statusEl) statusEl.textContent = "送信に失敗しました。お手数ですがInstagramからご連絡ください。";
          }
        })
        .catch(function () {
          if (statusEl) statusEl.textContent = "送信に失敗しました。お手数ですがInstagramからご連絡ください。";
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  } else if (formSection) {
    // 送信先未設定：フォームセクションごと非表示のまま（レイアウトは崩れません）
    formSection.style.display = "none";
  }

  /* ---------------------------------------------------------
     7. 法務ページリンク：URL未設定の間は案内のみ表示
     --------------------------------------------------------- */
  document.querySelectorAll("[data-legal]").forEach(function (link) {
    var key = link.getAttribute("data-legal");
    var url = LEGAL_LINKS[key];
    if (url) {
      link.setAttribute("href", url);
    } else {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        alert("このページは準備中です。URLが決まり次第、js/script.js の LEGAL_LINKS に設定してください。");
      });
    }
  });

  /* ---------------------------------------------------------
     8. スマートフォン固定CTA：フッター手前で隠す
     --------------------------------------------------------- */
  var stickyCta = document.querySelector(".sticky-cta");
  var footer = document.querySelector(".site-footer");

  if (stickyCta && footer && "IntersectionObserver" in window) {
    var footerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          stickyCta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.01 }
    );
    footerObserver.observe(footer);
  }
})();
