/* =========================================================
   StudyPlus - script.js
   Vanilla JavaScript. Everything degrades gracefully:
   the HTML links already work without this file.
   ========================================================= */

(function () {
  "use strict";

  // Mark the document as JS-enabled (reveal animations only hide content when JS runs)
  document.documentElement.classList.add("js");

  /* ---------- Constants ---------- */
  var WAITLIST_URL = "https://forms.gle/zerRo8dmR4DfrZVk9";
  var COMMUNITY_URL = "https://chat.whatsapp.com/CCpyIItFA2iA4EqPyCQ2qY?s=cl&p=a&mlu=4&ilr=4";
  var WHATSAPP_NUMBER = "2347052705386";
  var SUPPORT_EMAIL = "agwucomfort13@gmail.com";

  /* ---------- Helpers ---------- */
  // Build a WhatsApp link with a properly URL-encoded message
  function whatsappLink(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  // Safely open an external link in a new tab
  function openExternal(url) {
    var win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) { window.location.href = url; } // popup blocked: fall back to same tab
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Waitlist links: guarantee every one uses the same Google Form ---------- */
  var waitlistLinks = document.querySelectorAll('a[href^="https://forms.gle/"]');
  waitlistLinks.forEach(function (link) {
    link.setAttribute("href", WAITLIST_URL);
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  /* ---------- Community button: exact invitation link ---------- */
  var communityBtn = document.getElementById("communityBtn");
  if (communityBtn) {
    communityBtn.setAttribute("href", COMMUNITY_URL);
    communityBtn.setAttribute("target", "_blank");
    communityBtn.setAttribute("rel", "noopener noreferrer");
  }

  /* ---------- Resource buttons: unique prefilled WhatsApp message each ---------- */
  document.querySelectorAll(".resource-btn").forEach(function (btn) {
    var title = btn.getAttribute("data-resource");
    if (!title) { return; }
    var message = "Hello StudyPlus, I am interested in getting a copy of " + title + ". Please share the details with me.";
    btn.setAttribute("href", whatsappLink(message));
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener noreferrer");
    btn.setAttribute("aria-label", "Get your copy of " + title + " via WhatsApp");
  });

  /* ---------- Mobile navigation ---------- */
  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  function setMenu(open) {
    primaryNav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      setMenu(!primaryNav.classList.contains("open"));
    });

    // Close with Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && primaryNav.classList.contains("open")) {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close when tapping outside the header
    document.addEventListener("click", function (e) {
      if (primaryNav.classList.contains("open") && !header.contains(e.target)) {
        setMenu(false);
      }
    });

    // Reset when resizing to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960) { setMenu(false); }
    });
  }

  /* ---------- Smooth scrolling for all internal links ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      // Update the URL hash without jumping
      if (history.pushState) { history.pushState(null, "", id); }
      // Close the mobile menu after a link is chosen
      if (primaryNav && primaryNav.classList.contains("open")) { setMenu(false); }
    });
  });

  /* ---------- Sticky header style on scroll ---------- */
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link highlighting ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = ["home", "about", "challenge", "resources", "community", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    // Only now is it safe to hide elements, because we are about to reveal them
    document.documentElement.classList.add("reveal-ready");
    // Safety net: if anything goes wrong, show everything after 2.5 seconds
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
    }, 2500);
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(function (el, i) {
      // Small stagger for siblings so cards cascade in
      el.style.transitionDelay = (i % 3) * 80 + "ms";
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Contact form: validation + WhatsApp enquiry ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var nameInput = document.getElementById("fullName");
    var emailInput = document.getElementById("email");
    var messageInput = document.getElementById("message");
    var statusEl = document.getElementById("formStatus");

    function setError(input, errorId, text) {
      var field = input.closest(".field");
      document.getElementById(errorId).textContent = text;
      field.classList.toggle("invalid", Boolean(text));
      input.setAttribute("aria-invalid", text ? "true" : "false");
      return !text;
    }

    function validate() {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var message = messageInput.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

      var okName = setError(nameInput, "nameError",
        name.length < 2 ? "Please enter your full name." : "");
      var okEmail = setError(emailInput, "emailError",
        !email ? "Please enter your email address." :
        !emailPattern.test(email) ? "Please enter a valid email address." : "");
      var okMessage = setError(messageInput, "messageError",
        message.length < 10 ? "Please write a message of at least 10 characters." : "");

      return okName && okEmail && okMessage;
    }

    // Clear errors as the user corrects them
    [nameInput, emailInput, messageInput].forEach(function (input) {
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("invalid")) { validate(); }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.className = "form-status";
      statusEl.textContent = "";

      if (!validate()) {
        statusEl.classList.add("fail");
        statusEl.textContent = "Please fix the highlighted fields and try again.";
        return;
      }

      var text =
        "Hello StudyPlus, my name is " + nameInput.value.trim() + ".\n" +
        "Email: " + emailInput.value.trim() + "\n\n" +
        messageInput.value.trim();

      var url = whatsappLink(text);
      openExternal(url);

      // No backend exists: be clear that nothing was stored or sent automatically
      statusEl.classList.add("success");
      statusEl.innerHTML =
        "Thank you! This form does not send messages by itself. WhatsApp should now be open with your message ready, so please tap Send there. " +
        "If it did not open, <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener noreferrer\">open WhatsApp here</a> " +
        "or email us at <a href=\"mailto:" + SUPPORT_EMAIL + "\">" + SUPPORT_EMAIL + "</a>.";

      form.reset();
      [nameInput, emailInput, messageInput].forEach(function (input) {
        input.closest(".field").classList.remove("invalid");
        input.setAttribute("aria-invalid", "false");
      });
    });
  }
})();
