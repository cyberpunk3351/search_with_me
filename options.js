const container = document.getElementById("engines-container");
const addBtn = document.getElementById("add-btn");
const importBtn = document.getElementById("import-btn");
const exportBtn = document.getElementById("export-btn");
const importFile = document.getElementById("import-file");
const saveBtn = document.getElementById("save-btn");
const status = document.getElementById("status");
const dragState = {
  row: null
};

function getEngineInitial(name) {
  const value = String(name ?? "").trim();
  return value ? value[0].toUpperCase() : "?";
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.dataset.variant = isError ? "error" : "success";
  status.hidden = false;
}

function createEngineRow(engine = {}) {
  const row = document.createElement("div");
  row.className = "engine-row";
  row.dataset.engineId = engine.id ?? "";

  const meta = document.createElement("div");
  meta.className = "engine-meta";

  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "drag-handle";
  handle.title = "Drag to reorder";
  handle.setAttribute("aria-label", "Drag to reorder");
  handle.draggable = true;
  handle.innerHTML = '<span class="drag-handle-line"></span><span class="drag-handle-line"></span><span class="drag-handle-line"></span>';

  const icon = document.createElement("span");
  icon.className = "engine-icon";
  icon.title = "Favicon preview";

  const iconImage = document.createElement("img");
  iconImage.alt = "";
  iconImage.hidden = true;

  const iconFallback = document.createElement("span");
  iconFallback.className = "engine-icon-fallback";
  iconFallback.textContent = getEngineInitial(engine.name);

  const updateIcon = () => {
    iconFallback.textContent = getEngineInitial(nameInput.value);

    const faviconUrl = getEngineFaviconUrl(urlInput.value);
    if (!faviconUrl) {
      iconImage.hidden = true;
      iconFallback.hidden = false;
      return;
    }

    iconImage.hidden = false;
    iconFallback.hidden = true;
    iconImage.src = `${faviconUrl}?cache=${Date.now()}`;
  };

  iconImage.addEventListener("error", () => {
    iconImage.hidden = true;
    iconFallback.hidden = false;
  });
  
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Engine Name";
  nameInput.className = "name-input";
  nameInput.value = engine.name ?? "";
  
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "Search URL (e.g. https://site.com/search?q=%s)";
  urlInput.className = "url-input";
  urlInput.value = engine.url ?? "";

  const clearError = () => {
    nameInput.classList.remove("input-error");
    urlInput.classList.remove("input-error");
    updateIcon();
  };

  nameInput.addEventListener("input", clearError);
  urlInput.addEventListener("input", clearError);
  
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.type = "button";
  removeBtn.title = "Remove engine";
  removeBtn.setAttribute("aria-label", "Remove engine");
  removeBtn.innerHTML = '<span class="trash-icon" aria-hidden="true"></span>';
  removeBtn.onclick = () => {
    row.remove();
    if (container.children.length === 0) {
      setStatus("Add at least one search engine.", true);
    }
  };

  handle.addEventListener("dragstart", (event) => {
    dragState.row = row;
    row.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.dataset.engineId || "");
  });

  handle.addEventListener("dragend", () => {
    dragState.row = null;
    row.classList.remove("dragging");
    container.querySelectorAll(".drop-target").forEach((item) => item.classList.remove("drop-target"));
  });

  row.addEventListener("dragover", (event) => {
    if (!dragState.row || dragState.row === row) {
      return;
    }

    event.preventDefault();
    const rect = row.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    row.dataset.dropPosition = before ? "before" : "after";
    row.classList.add("drop-target");
  });

  row.addEventListener("dragleave", () => {
    row.classList.remove("drop-target");
    delete row.dataset.dropPosition;
  });

  row.addEventListener("drop", (event) => {
    if (!dragState.row || dragState.row === row) {
      return;
    }

    event.preventDefault();
    row.classList.remove("drop-target");
    const before = row.dataset.dropPosition !== "after";

    if (before) {
      container.insertBefore(dragState.row, row);
    } else {
      container.insertBefore(dragState.row, row.nextSibling);
    }

    delete row.dataset.dropPosition;
    setStatus("Order updated.");
  });
  
  icon.append(iconImage, iconFallback);
  meta.append(handle, icon);
  row.append(meta, nameInput, urlInput, removeBtn);
  container.append(row);

  updateIcon();
}

function renderEngines(engines) {
  container.replaceChildren();
  engines.forEach((engine) => createEngineRow(engine));
}

async function loadSettings() {
  const engines = await getStoredEngines();
  renderEngines(engines);
}

function clearValidationErrors() {
  container.querySelectorAll(".input-error").forEach((input) => input.classList.remove("input-error"));
}

function readEnginesFromForm() {
  clearValidationErrors();

  const rows = Array.from(container.querySelectorAll(".engine-row"));
  const engines = [];
  let hasErrors = false;

  for (const row of rows) {
    const nameInput = row.querySelector(".name-input");
    const urlInput = row.querySelector(".url-input");
    const name = nameInput.value.trim();
    const url = urlInput.value.trim();
    let rowIsValid = true;

    if (!name) {
      nameInput.classList.add("input-error");
      rowIsValid = false;
    }

    if (!url) {
      urlInput.classList.add("input-error");
      rowIsValid = false;
    } else if (!isValidSearchUrl(url)) {
      urlInput.classList.add("input-error");
      rowIsValid = false;
    }

    if (!rowIsValid) {
      hasErrors = true;
      continue;
    }

    engines.push({
      id: row.dataset.engineId || undefined,
      name,
      url
    });
  }

  return { engines, hasErrors };
}

async function saveSettings() {
  const { engines, hasErrors } = readEnginesFromForm();

  if (hasErrors) {
    setStatus("Fix the highlighted fields before saving.", true);
    return;
  }

  if (engines.length === 0) {
    setStatus("Add at least one search engine before saving.", true);
    return;
  }

  await saveEngines(engines);
  setStatus("Settings saved.");
}

function exportEngines() {
  const { engines, hasErrors } = readEnginesFromForm();

  if (hasErrors) {
    setStatus("Fix the highlighted fields before exporting.", true);
    return;
  }

  if (engines.length === 0) {
    setStatus("Add at least one search engine before exporting.", true);
    return;
  }

  const payload = {
    version: 1,
    engines
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  link.href = url;
  link.download = `search-with-me-engines-${stamp}.json`;
  link.click();

  URL.revokeObjectURL(url);
  setStatus("Exported JSON file.");
}

function extractEnginesFromJson(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.engines)) {
    return payload.engines;
  }

  return null;
}

async function importEnginesFromFile(file) {
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const engines = extractEnginesFromJson(payload);

    if (!engines) {
      setStatus("Invalid import file. Expected an array or { engines: [...] }.", true);
      return;
    }

    const normalized = engines
      .map((engine) => ({
        id: engine?.id,
        name: String(engine?.name ?? "").trim(),
        url: String(engine?.url ?? "").trim()
      }))
      .filter((engine) => engine.name && engine.url && isValidSearchUrl(engine.url));

    if (normalized.length === 0) {
      setStatus("The import file does not contain any valid engines.", true);
      return;
    }

    await saveEngines(normalized);
    renderEngines(normalized);
    setStatus(`Imported ${normalized.length} search engine${normalized.length === 1 ? "" : "s"}.`);
  } catch (error) {
    setStatus("Import failed. Check that the file is valid JSON.", true);
  } finally {
    importFile.value = "";
  }
}

addBtn.onclick = () => {
  createEngineRow();
  setStatus("New empty row added.");
};
exportBtn.onclick = exportEngines;
importBtn.onclick = () => importFile.click();
importFile.onchange = async () => {
  const [file] = importFile.files || [];
  if (file) {
    await importEnginesFromFile(file);
  }
};
saveBtn.onclick = saveSettings;
document.addEventListener("DOMContentLoaded", loadSettings);
