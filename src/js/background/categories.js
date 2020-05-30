// functions to set the category
const categories = {};

// function to set the category
categories.set = async (nzb) => {
  let category = "";
  try {
    if (settings.category.enabled.enabled) {
      debugLog.info("start setting the category")();
      category = await categories[settings.category.enabled.type](nzb);
      debugLog.info(`the category was set to: ${category}`)();
    } else {
      debugLog.info("category setting is not enabled")();
    }
  } catch (e) {
    // if we have an error, send notifcation and continue without a category
    errorHandler(e, nzb.log.id());
  }
  nzb.category = category;
  nzb.log.set("category", nzb.category);
  return nzb;
};

// function to automatically set the category
categories.automatic = async (nzb) => {
  debugLog.info("testing for automatic categories")();
  let category = "";
  for (var i = 0; i < settings.category.automatic.categories.length; i++) {
    var re = new RegExp(settings.category.automatic.categories[i].pattern, "i");
    debugLog.info(`testing for category ${settings.category.automatic.categories[i].name}`)();
    if (isset(() => nzb.title) && re.test(nzb.title)) {
      debugLog.info(`match found while testing for category ${settings.category.automatic.categories[i].name}`)();
      category = settings.category.automatic.categories[i].name;
      break;
    }
  }
  if (category === "") {
    debugLog.info("testing for automatic categories did not match")();
    if (settings.category.automatic.fallback) {
      debugLog.info(`fall-back action is set to: ${settings.category.automatic.fallback}`)();
      category = await categories[settings.category.automatic.fallback](nzb);
    }
  }
  return category;
};

// function to manually set the category
categories.manual = async (nzb) => {
  debugLog.info("starting manual category selection")();
  let targetCategories = [];
  targetCategories = await categories.targetCategories.manual();
  return await categories.select(nzb, targetCategories);
};

// function to prompt the user for manual category selection
categories.select = async (nzb, targetCategories) => {
  const win = await browser.windows.getCurrent();
  const width = 540;
  const height = 680;
  const left = ((win.width / 2) - (width / 2)) + win.left;
  const top = ((screen.height / 2) - (height / 2));
  const window = await browser.windows.create({
    url: "/html/popups/categoryselection.html",
    width: width,
    height: height,
    top: Math.round(top),
    left: Math.round(left),
    type: "popup",
  });
  const windowId = window.id;
  debugLog.info(`opened popup window with id ${windowId} for category selection`)();
  const waitForPopup = new Promise((resolve, reject) => {
    // onRemoveWindowListener function
    const onRemoveWindowListener = (winId) => {
      if (windowId == winId) {
        debugLog.warn(`popup window with id ${windowId} for category selection was closed before sending a message`)();
        resolve("");
      }
    };
    // onConnectListener function
    const onConnectListener = (port) => {
      if (port.name == `CategorySelection_${windowId}`) {
        port.onMessage.addListener(async (response) => {
          if (response.windowId === windowId) {
            if (response.ready) {
              debugLog.info(`received ready message from popup window with id ${port.sender.tab.windowId}`)();
              debugLog.info(`sending categories to popup window with id ${port.sender.tab.windowId} for category selection`)();
              port.postMessage({
                categories: targetCategories,
                title: nzb.title,
                id: nzb.log.id(),
                windowId: windowId,
              });
            } else if (typeof response.category === "string") {
              debugLog.info(`received selected category message from popup window with id ${port.sender.tab.windowId}`)();
              port.onMessage.removeListener(this);
              browser.windows.onRemoved.removeListener(onRemoveWindowListener);
              browser.runtime.onConnect.removeListener(onConnectListener);
              browser.windows.remove(windowId);
              resolve(response.category);
            } else if (response.category === false) {
              port.onMessage.removeListener(this);
              browser.windows.onRemoved.removeListener(onRemoveWindowListener);
              browser.runtime.onConnect.removeListener(onConnectListener);
              browser.windows.remove(windowId);
              debugLog.warn(`received cancelled message from popup window with id ${port.sender.tab.windowId}`)();
              resolve("");
            } else {
              reject(new Error(browser.i18n.getMessage("unknownError")));
            }
          }
        });
      }
    };
    browser.windows.onRemoved.addListener(onRemoveWindowListener);
    browser.runtime.onConnect.addListener(onConnectListener);
  });
  const category = await waitForPopup;
  return category;
};

// functions to get the set categories
categories.targetCategories = {};

// function to get the set target categories
categories.targetCategories.get = async () => {
  return await categories.targetCategories[settings.category.enabled.type]();
};

// function to get the set automatic categories
categories.targetCategories.automatic = () => {
  let targetCategories = [];
  for (var i = 0; i < settings.category.automatic.categories.length; i++) {
    targetCategories.push(settings.category.automatic.categories[i].name);
  }
  return targetCategories;
};

// function to get the set manual categories
categories.targetCategories.manual = async () => {
  if (settings.category.manual.type === "target") {
    if (isset(() => target[settings.nzbtarget.type].getCategories)) {
      return await target[settings.nzbtarget.type].getCategories();
    } else {
      debugLog.warn("manual category selection from target not possible with selected nzb target")();
      return [];
    }
  } else {
    return settings.category.manual.categories;
  }
};

// function to get all set categories (including the categories from fallback if automatic categories are set)
categories.targetCategories.all = async () => {
  let targetCategories = await categories.targetCategories[settings.category.enabled.type]();
  if (settings.category.enabled.type === "automatic" && settings.category.automatic.fallback) {
    targetCategories = targetCategories.concat(await categories.targetCategories[settings.category.automatic.fallback]());
  }
  return [...new Set(targetCategories)];
};
