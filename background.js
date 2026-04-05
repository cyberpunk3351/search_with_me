async function updateMenus() {
  try {
    await browser.menus.removeAll();
    const engines = await getStoredEngines();

    if (engines.length === 0) {
      return;
    }

    await browser.menus.create({
      id: MENU_ROOT_ID,
      title: "Search with me",
      contexts: ["selection"]
    });

    for (const engine of engines) {
      await browser.menus.create({
        id: `engine:${engine.id}`,
        parentId: MENU_ROOT_ID,
        title: engine.name,
        contexts: ["selection"]
      });
    }
  } catch (error) {
    console.error("Failed to update context menus:", error);
  }
}

browser.menus.onClicked.addListener(async (info) => {
  try {
    const menuItemId = String(info.menuItemId ?? "");
    if (!menuItemId.startsWith("engine:") || !info.selectionText) {
      return;
    }

    const engineId = menuItemId.slice("engine:".length);
    const engines = await getStoredEngines();
    const engine = engines.find((entry) => entry.id === engineId);

    if (!engine) {
      return;
    }

    const url = buildSearchUrl(engine.url, info.selectionText);
    if (url) {
      await browser.tabs.create({ url });
    }
  } catch (error) {
    console.error("Failed to handle menu click:", error);
  }
});

// Update menus on startup and whenever storage changes
browser.runtime.onInstalled.addListener(updateMenus);
browser.runtime.onStartup.addListener(updateMenus);
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_KEY]) {
    updateMenus();
  }
});
