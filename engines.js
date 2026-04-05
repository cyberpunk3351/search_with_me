const STORAGE_KEY = "engines";
const MENU_ROOT_ID = "search-with";

const DEFAULT_ENGINES = Object.freeze([
  {
    id: "default-duckduckgo",
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?ia=web&q=%s"
  }
]);

function createEngineId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return `engine-${globalThis.crypto.randomUUID()}`;
  }

  return `engine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneEngines(engines) {
  return engines.map((engine) => ({ ...engine }));
}

function normalizeEngine(engine) {
  if (!engine || typeof engine !== "object") {
    return null;
  }

  const name = String(engine.name ?? "").trim();
  const url = String(engine.url ?? "").trim();

  if (!name || !url) {
    return null;
  }

  return {
    id: String(engine.id ?? "").trim() || createEngineId(),
    name,
    url
  };
}

function normalizeEngineList(engines) {
  if (!Array.isArray(engines)) {
    return [];
  }

  return engines.map(normalizeEngine).filter(Boolean);
}

async function getStoredEngines() {
  const settings = await browser.storage.local.get(STORAGE_KEY);
  const engines = normalizeEngineList(settings[STORAGE_KEY]);

  if (engines.length > 0) {
    return engines;
  }

  return cloneEngines(DEFAULT_ENGINES);
}

async function saveEngines(engines) {
  await browser.storage.local.set({
    [STORAGE_KEY]: normalizeEngineList(engines)
  });
}

function buildSearchUrl(template, selectionText) {
  const searchTemplate = String(template ?? "").trim();
  const query = encodeURIComponent(String(selectionText ?? "").trim());

  if (!searchTemplate) {
    return "";
  }

  if (searchTemplate.includes("%s")) {
    return searchTemplate.split("%s").join(query);
  }

  const separator = searchTemplate.includes("?") ? "&" : "?";
  return `${searchTemplate}${separator}q=${query}`;
}

function isValidSearchUrl(template) {
  const candidate = buildSearchUrl(template, "__search_validation__");

  if (!candidate) {
    return false;
  }

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function getEngineFaviconUrl(template) {
  const searchTemplate = String(template ?? "").trim();

  if (!searchTemplate) {
    return "";
  }

  const resolved = searchTemplate.includes("%s")
    ? searchTemplate.replace("%s", "")
    : searchTemplate;

  try {
    const parsed = new URL(resolved);
    return `${parsed.protocol}//${parsed.host}/favicon.ico`;
  } catch {
    return "";
  }
}
