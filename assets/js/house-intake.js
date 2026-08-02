// File: assets/js/house-intake.js

/*
  Phase: 02B_Index_Page_Intake_Device

  Purpose:
  - Renders and controls the reusable House audience intake component.
  - Submits to the approved House of Meadnyte Mailchimp audience without exposing an API key.
  - Captures restrained source/UTM attribution and emits analytics hooks without loading analytics.

  Reuse:
  - Add an element with [data-house-intake] and a data-house-intake-config JSON path.
  - Override source/context/default interest with data-house-intake-* attributes.
  - Add Mailchimp group input mappings in house-intake.json when group IDs are commissioned.
*/

(function () {
  "use strict";

  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeStorageGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // Attribution storage is optional; form operation must continue without it.
    }
  }

  function captureAttribution() {
    const query = new URLSearchParams(window.location.search);
    const attribution = {};

    UTM_KEYS.forEach(function (key) {
      const incomingValue = query.get(key);
      const storedValue = safeStorageGet("meadnyte_intake_" + key);

      if (incomingValue) {
        safeStorageSet("meadnyte_intake_" + key, incomingValue);
        attribution[key] = incomingValue;
      } else if (storedValue) {
        attribution[key] = storedValue;
      }
    });

    return attribution;
  }

  function compactValue(value) {
    return String(value || "")
      .replace(/[;|=]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  }

  function buildAttributionValue(interests, source, context, attribution) {
    const parts = [
      "interests=" + interests.map(compactValue).join(","),
      "source=" + compactValue(source),
      "page=" + compactValue(context)
    ];

    UTM_KEYS.forEach(function (key) {
      if (attribution[key]) {
        parts.push(key + "=" + compactValue(attribution[key]));
      }
    });

    return parts.join(";").slice(0, 255);
  }

  function emitEvent(name, detail) {
    const payload = Object.assign({ event: name }, detail || {});

    window.dispatchEvent(new CustomEvent("meadnyte:" + name, { detail: payload }));

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  }

  function observeView(root, eventName, detail) {
    let recorded = false;

    function record() {
      if (recorded) {
        return;
      }

      recorded = true;
      emitEvent(eventName, detail);
    }

    if (!("IntersectionObserver" in window)) {
      record();
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        record();
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(root);
  }

  function submitProvider(url, parameters, provider) {
    const action = new URL(url);
    action.searchParams.set("u", provider.accountId);
    action.searchParams.set("id", provider.audienceId);

    return fetch(action.toString(), {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      body: parameters
    });
  }

  function renderChoice(interest, index, defaultInterest) {
    const id = "house-intake-interest-" + escapeHtml(interest.id) + "-" + index;
    const checked = interest.id === defaultInterest ? " checked" : "";
    const exclusive = interest.exclusive ? " data-exclusive=\"true\"" : "";

    return [
      "<label class=\"house-intake__choice\" for=\"" + id + "\">",
      "<input class=\"house-intake__checkbox\" id=\"" + id + "\" type=\"checkbox\" value=\"" + escapeHtml(interest.id) + "\"" + exclusive + checked + ">",
      "<span class=\"house-intake__choice-mark\" aria-hidden=\"true\"></span>",
      "<span class=\"house-intake__choice-label\">" + escapeHtml(interest.label) + "</span>",
      "</label>"
    ].join("");
  }

  function renderComponent(root, config) {
    const copy = config.copy;
    const defaultInterest = root.dataset.houseIntakeDefaultInterest || "";
    const instanceId = root.id || "house-intake";
    const titleId = instanceId + "-title";
    const interestErrorId = instanceId + "-interest-error";
    const statusId = instanceId + "-status";
    const choices = config.interests.map(function (interest, index) {
      return renderChoice(interest, index, defaultInterest);
    }).join("");

    root.setAttribute("aria-labelledby", titleId);
    root.innerHTML = [
      "<div class=\"house-intake__inner\">",
      "<h2 class=\"house-intake__title\" id=\"" + titleId + "\">" + escapeHtml(copy.title) + "</h2>",
      "<form class=\"house-intake__form\" data-house-intake-form novalidate>",
      "<div class=\"house-intake__identity\">",
      "<div class=\"house-intake__field\">",
      "<label class=\"house-intake__label\" for=\"" + instanceId + "-first-name\">First Name</label>",
      "<input class=\"house-intake__input\" id=\"" + instanceId + "-first-name\" name=\"first-name\" type=\"text\" autocomplete=\"given-name\" required>",
      "<p class=\"house-intake__error\" data-error-for=\"first-name\" aria-live=\"polite\"></p>",
      "</div>",
      "<div class=\"house-intake__field\">",
      "<label class=\"house-intake__label\" for=\"" + instanceId + "-last-name\">Last Name</label>",
      "<input class=\"house-intake__input\" id=\"" + instanceId + "-last-name\" name=\"last-name\" type=\"text\" autocomplete=\"family-name\" required>",
      "<p class=\"house-intake__error\" data-error-for=\"last-name\" aria-live=\"polite\"></p>",
      "</div>",
      "<div class=\"house-intake__field house-intake__field--email\">",
      "<label class=\"house-intake__label\" for=\"" + instanceId + "-email\">Email Address</label>",
      "<input class=\"house-intake__input\" id=\"" + instanceId + "-email\" name=\"email\" type=\"email\" inputmode=\"email\" autocomplete=\"email\" autocapitalize=\"none\" spellcheck=\"false\" required>",
      "<p class=\"house-intake__error\" data-error-for=\"email\" aria-live=\"polite\"></p>",
      "</div>",
      "</div>",
      "<fieldset class=\"house-intake__interests\" aria-describedby=\"" + interestErrorId + "\">",
      "<legend class=\"house-intake__legend\">" + escapeHtml(copy.interestPrompt) + "</legend>",
      "<div class=\"house-intake__choices\">" + choices + "</div>",
      "<p class=\"house-intake__error\" id=\"" + interestErrorId + "\" data-error-for=\"interests\" aria-live=\"polite\"></p>",
      "</fieldset>",
      "<div class=\"house-intake__honeypot\" aria-hidden=\"true\">",
      "<label for=\"" + instanceId + "-website\">Leave this field empty</label>",
      "<input id=\"" + instanceId + "-website\" name=\"website\" type=\"text\" tabindex=\"-1\" autocomplete=\"off\">",
      "</div>",
      "<button class=\"house-intake__action\" type=\"submit\" data-reflection=\"" + escapeHtml(copy.submit) + "\">" + escapeHtml(copy.submit) + "</button>",
      "<p class=\"house-intake__consent\">" + escapeHtml(copy.consent) + "</p>",
      "</form>",
      "<p class=\"house-intake__status\" id=\"" + statusId + "\" data-house-intake-status role=\"status\" aria-live=\"polite\" tabindex=\"-1\" hidden></p>",
      "</div>"
    ].join("");
  }

  function selectedInterests(form) {
    return Array.from(form.querySelectorAll(".house-intake__checkbox:checked")).map(function (input) {
      return input.value;
    });
  }

  function showFieldError(form, fieldName, message) {
    const field = form.elements[fieldName];
    const error = form.querySelector("[data-error-for=\"" + fieldName + "\"]");

    if (field) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }

    if (error) {
      error.textContent = message || "";
    }
  }

  function validateForm(form) {
    const firstName = form.elements["first-name"];
    const lastName = form.elements["last-name"];
    const email = form.elements.email;
    const interests = selectedInterests(form);
    let valid = true;

    showFieldError(form, "first-name", "");
    showFieldError(form, "last-name", "");
    showFieldError(form, "email", "");
    showFieldError(form, "interests", "");

    if (!firstName.value.trim()) {
      showFieldError(form, "first-name", "Please enter your first name.");
      valid = false;
    }

    if (!lastName.value.trim()) {
      showFieldError(form, "last-name", "Please enter your last name.");
      valid = false;
    }

    if (!email.value.trim()) {
      showFieldError(form, "email", "Please enter your email address.");
      valid = false;
    } else if (!email.validity.valid) {
      showFieldError(form, "email", "Please enter a valid email address.");
      valid = false;
    }

    if (!interests.length) {
      showFieldError(form, "interests", "Choose at least one path of discovery.");
      valid = false;
    }

    return valid;
  }

  function applyExclusiveInterestBehavior(form) {
    const checkboxes = Array.from(form.querySelectorAll(".house-intake__checkbox"));

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        const isExclusive = checkbox.dataset.exclusive === "true";

        if (checkbox.checked && isExclusive) {
          checkboxes.forEach(function (other) {
            if (other !== checkbox) {
              other.checked = false;
            }
          });
        } else if (checkbox.checked) {
          checkboxes.forEach(function (other) {
            if (other.dataset.exclusive === "true") {
              other.checked = false;
            }
          });
        }

        showFieldError(form, "interests", "");
      });
    });
  }

  function addProviderInterests(parameters, config, interests) {
    const mappings = config.providerConfig.interestFields || {};
    let mapped = interests.length > 0;

    interests.forEach(function (interest) {
      const mapping = mappings[interest];

      if (mapping && mapping.name) {
        parameters.set(mapping.name, mapping.value || "1");
      } else {
        mapped = false;
      }
    });

    return mapped;
  }

  function setBusy(form, busy) {
    const button = form.querySelector(".house-intake__action");
    button.setAttribute("aria-disabled", busy ? "true" : "false");
    button.disabled = busy;
  }

  function showStatus(root, config, message, includeProviderLink) {
    const form = root.querySelector("[data-house-intake-form]");
    const status = root.querySelector("[data-house-intake-status]");

    form.hidden = true;
    status.hidden = false;
    status.textContent = message;

    if (includeProviderLink) {
      const spacer = document.createTextNode(" ");
      const link = document.createElement("a");
      link.className = "house-intake__provider-link";
      link.href = config.providerConfig.hostedFormUrl;
      link.textContent = "Continue securely.";
      status.append(spacer, link);
    }

    status.focus({ preventScroll: true });
  }

  function bindComponent(root, config) {
    const form = root.querySelector("[data-house-intake-form]");
    const source = root.dataset.houseIntakeSource || "meadnyte-website";
    const context = root.dataset.houseIntakeContext || window.location.pathname;
    const analytics = config.analytics || {};
    const attribution = captureAttribution();

    applyExclusiveInterestBehavior(form);
    observeView(root, analytics.view || "intake_view", { intake_source: source, intake_context: context });

    Array.from(form.querySelectorAll(".house-intake__input")).forEach(function (input) {
      input.addEventListener("input", function () {
        showFieldError(form, input.name, "");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (form.elements.website.value || !validateForm(form)) {
        const firstInvalid = form.querySelector("[aria-invalid=\"true\"]");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      const firstName = form.elements["first-name"].value.trim();
      const lastName = form.elements["last-name"].value.trim();
      const email = form.elements.email.value.trim();
      const interests = selectedInterests(form);
      const provider = config.providerConfig;
      const parameters = new URLSearchParams();

      parameters.set("u", provider.accountId);
      parameters.set("id", provider.audienceId);
      parameters.set(provider.fields.firstName, firstName);
      parameters.set(provider.fields.lastName, lastName);
      parameters.set(provider.fields.email, email);

      Object.keys(provider.hiddenDefaults || {}).forEach(function (name) {
        parameters.set(name, provider.hiddenDefaults[name]);
      });

      if (!addProviderInterests(parameters, config, interests)) {
        parameters.set(
          provider.fields.interestFallback,
          buildAttributionValue(interests, source, context, attribution)
        );
      }

      setBusy(form, true);
      const status = root.querySelector("[data-house-intake-status]");
      status.hidden = true;
      status.textContent = "";
      emitEvent(analytics.submit || "intake_submit", {
        intake_source: source,
        intake_context: context,
        intake_interests: interests.join(",")
      });

      submitProvider(provider.action, parameters, provider).then(function () {
        emitEvent(analytics.accepted || "intake_accepted", {
          intake_source: source,
          intake_context: context,
          intake_interests: interests.join(",")
        });
        form.reset();
        showStatus(root, config, config.copy.pending, false);
      }).catch(function (error) {
        setBusy(form, false);
        showStatus(root, config, config.copy.providerUnavailable, true);
      });
    });
  }

  function renderUnavailable(root, hostedFormUrl, message) {
    root.innerHTML = [
      "<div class=\"house-intake__inner\">",
      "<h2 class=\"house-intake__title\">ENTER THE INNER SANCTUM</h2>",
      "<p class=\"house-intake__status\">" + escapeHtml(message) + " ",
      "<a class=\"house-intake__provider-link\" href=\"" + escapeHtml(hostedFormUrl) + "\">Continue securely.</a>",
      "</p>",
      "</div>"
    ].join("");
  }

  function initComponent(root) {
    const configUrl = root.dataset.houseIntakeConfig;

    if (!configUrl) {
      return;
    }

    fetch(configUrl, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Unable to load intake configuration");
        }
        return response.json();
      })
      .then(function (config) {
        renderComponent(root, config);
        bindComponent(root, config);
      })
      .catch(function () {
        renderUnavailable(
          root,
          "https://eepurl.com/dILscT",
          "The threshold is temporarily obscured."
        );
      });
  }

  function init() {
    Array.from(document.querySelectorAll("[data-house-intake]")).forEach(initComponent);
  }

  window.MEADNYTE_HOUSE_INTAKE = Object.freeze({ init: init });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
