const SUPPORTED_LANGUAGES = ["pl", "en", "de"];
const DEFAULT_LANGUAGE = "pl";
const STORAGE_KEY = "akwarium-language";

const getTranslation = (language, key) =>
  key
    .split(".")
    .reduce((value, part) => value?.[part], window.AKWARIUM_TRANSLATIONS[language]);

const normalizeLanguage = (language) => {
  const code = language?.toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.includes(code) ? code : DEFAULT_LANGUAGE;
};

const getInitialLanguage = () => {
  const params = new URLSearchParams(window.location.search);
  const urlLanguage = params.get("lang");

  if (urlLanguage) {
    return normalizeLanguage(urlLanguage);
  }

  const savedLanguage = safeStorageGet(STORAGE_KEY);

  if (savedLanguage) {
    return normalizeLanguage(savedLanguage);
  }

  return normalizeLanguage(navigator.language);
};

const updateUrlLanguage = (language) => {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);

  try {
    window.history.replaceState({}, "", url);
  } catch {
    // Keep the language switch working even if history updates are unavailable.
  }
};

const safeStorageGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeStorageSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The URL query parameter still carries the selected language.
  }
};

const applyLanguage = (language) => {
  document.documentElement.lang = language;
  document.title = getTranslation(language, "meta.title");
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", getTranslation(language, "meta.description"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getTranslation(language, element.dataset.i18n) ?? "";
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      getTranslation(language, element.dataset.i18nAriaLabel) ?? "",
    );
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === language;
    button.setAttribute("aria-pressed", String(isActive));
  });

  safeStorageSet(STORAGE_KEY, language);
  updateUrlLanguage(language);
};

const initialLanguage = getInitialLanguage();

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(normalizeLanguage(button.dataset.language));
  });
});

applyLanguage(initialLanguage);
