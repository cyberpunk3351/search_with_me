const defaultEngines = [
  { id: "rutracker", name: "Rutracker", url: "https://rutracker.net/forum/tracker.php?nm=%s" }
];

async function updateMenus() {
  await browser.menus.removeAll();
  
  const settings = await browser.storage.local.get("engines");
  const engines = settings.engines || defaultEngines;

  if (engines.length === 0) return;

  browser.menus.create({
    id: "search-with",
    title: "Search with me",
    contexts: ["selection"]
  });

  engines.forEach((engine, index) => {
    browser.menus.create({
      id: `engine-${index}`,
      parentId: "search-with",
      title: engine.name,
      contexts: ["selection"]
    });
  });
}

browser.menus.onClicked.addListener(async (info, tab) => {
  const settings = await browser.storage.local.get("engines");
  const engines = settings.engines || defaultEngines;
  
  const match = info.menuItemId.match(/^engine-(\d+)$/);
  if (match) {
    const index = parseInt(match[1], 10);
    const engine = engines[index];
    if (engine) {
      const query = encodeURIComponent(info.selectionText);
      const url = engine.url.replace("%s", query);
      browser.tabs.create({ url: url });
    }
  }
});

// Update menus on startup and whenever storage changes
browser.runtime.onInstalled.addListener(updateMenus);
browser.runtime.onStartup.addListener(updateMenus);
browser.storage.onChanged.addListener(updateMenus);
