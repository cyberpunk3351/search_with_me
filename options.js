const container = document.getElementById("engines-container");
const addBtn = document.getElementById("add-btn");
const saveBtn = document.getElementById("save-btn");

function createEngineRow(name = "", url = "") {
  const row = document.createElement("div");
  row.className = "engine-row";
  
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Engine Name";
  nameInput.className = "name-input";
  nameInput.value = name;
  
  const urlInput = document.createElement("input");
  urlInput.type = "text";
  urlInput.placeholder = "Search URL (e.g. https://site.com/search?q=%s)";
  urlInput.className = "url-input";
  urlInput.value = url;
  
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Remove";
  removeBtn.className = "remove-btn";
  removeBtn.onclick = () => row.remove();
  
  row.append(nameInput, urlInput, removeBtn);
  container.append(row);
}

// Default settings if empty
const defaultEngines = [
  { name: "Rutracker", url: "https://rutracker.net/forum/tracker.php?nm=%s" }
];

async function loadSettings() {
  const settings = await browser.storage.local.get("engines");
  const engines = settings.engines || defaultEngines;
  engines.forEach(e => createEngineRow(e.name, e.url));
}

async function saveSettings() {
  const rows = document.querySelectorAll(".engine-row");
  const engines = Array.from(rows).map(row => ({
    name: row.querySelector(".name-input").value,
    url: row.querySelector(".url-input").value
  })).filter(e => e.name && e.url);
  
  await browser.storage.local.set({ engines });
  alert("Settings saved!");
}

addBtn.onclick = () => createEngineRow();
saveBtn.onclick = saveSettings;
document.addEventListener("DOMContentLoaded", loadSettings);
