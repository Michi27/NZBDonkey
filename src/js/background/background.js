// modify the promise prototype to add function "any"
// from https://stackoverflow.com/questions/39940152/get-first-fulfilled-promise
Promise.prototype.invert = function () {
  return new Promise((res, rej) => this.then(rej, res));
};
Promise.any = function (ps) {
  return Promise.all(ps.map((p) => p.invert()))
    .invert();
};

// add event handler for uncought errors
window.addEventListener("error", function(e) {
  errorHandler(e);
});

// define global nzbDonkey variable for the nzbDonkey context menu ID
const contextMenuID = "NZBDonkey";

// define global nzbDonkey variable for the downloads counter
var counter = 0;

// define global nzbDonkey variable for the downloads logs
var logs = [];

// define global nzbDonkey variable for the nzbDoneky settings
var settings = {};

// define global nzbDonkey variable for the nzbDoneky target functions
var target = {};

// define global nzbDonkey variable for the storage
var storage = {};

// define global nzbDonkey variable for the storage -> fall back to storage.local if storage.sync is not available
try {
  if (isset(() => browser.storage.sync)) {
    storage = browser.storage.sync;
    debugLog.info("storage set to storage.sync")();
  }
  else if (isset(() => browser.storage.local)) {
    storage = browser.storage.local;
    debugLog.info("storage set to storage.local")();
  }
  else {
    throw new Error("Your browser does not support neither storage.sync nor storage.local to store the settings!");
  }
}
catch (e) {
  errorHandler(e);
}

// listen for the onInstalled event
browser.runtime.onInstalled.addListener(async function (details) {
  try {

    // For debugging the onInstalled event
    details.OnInstalledReason = "install";
    details.previousVersion = "0.6.4";

    if (details.OnInstalledReason === "update") {
      debugLog.info(`NZBDonkey was updated from version ${details.previousVersion}`)();
      if (parseFloat(details.previousVersion) < 0.7) {
        // re-assigne updated settings in v0.7
        debugLog.info("updating stored settings from versions < 0.7")();
        const obj = await storage.get("execType.type");
        if (obj && obj["execType.type"]) {
          debugLog.info("found old settings 'execType.type' from versions < 0.7")();
          storage.set({
            "nzbtarget.type": obj["execType.type"]
          });
          await storage.remove("execType.type");
          debugLog.info("old settings 'execType.type' updated to 'nzbtarget.type'")();
        } else {
          debugLog.info("no old settings from versions < 0.7 were found")();
        }
      } else if (details.OnInstalledReason === "install") {
        // upon a new install delete the storage
        await storage.clear();
        debugLog.info("storage was cleared")();
      }
      // remove old searchengines and interception default settings
      debugLog.info("removing old searchengines and interception default settings")();
      await storage.remove("searchengines.default");
      await storage.remove("interception.enabled.default");
    }
    // open the options page to have the default settings saved
    debugLog.info("opening options page after an onInstalled event")();
    await browser.runtime.openOptionsPage();
    // starting the acctual script with 1000 ms delay to allow the default settings to be saved first
    debugLog.info("starting the script after an onInstalled event")();
    setTimeout(startScript, 1000);
  }
  catch (e) {
    errorHandler(e);
  }
});

// listen for the onStartup event
browser.runtime.onStartup.addListener(function () {
  debugLog.info("starting the script upon startup of the browser")();
  startScript();
});

// define all nzbDonkey functions

// function to start the script
async function startScript() {
  try {
    debugLog.info("trying to load the settings")();
    await loadSettings();
    debugLog.info("settings successfully loaded")();
  }
  catch (e) {
    e.message = browser.i18n.getMessage("NotificationSettingsNotLoaded") + "\n" + e.message;
    errorHandler(e);
    return;
  }
  try {
    debugLog.info("trying to initialize the script")();
    initializeScript();
    debugLog.info("the script was initialized successfully")();
  }
  catch (e) {
    e.message = browser.i18n.getMessage("NotificationFaildToInitialize") + "\n" + e.message;
    errorHandler(e);
  }
}

// function to load the settings
async function loadSettings() {
  // load the settings
  const obj = await storage.get(null);
  // the settings are all single objects so we create a nested object "settings"
  const createNestedObject = (obj, path, val) => {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const lastObj = keys.reduce((obj, key) =>
      obj[key] = obj[key] || {},
      obj);
    lastObj[lastKey] = val;
  };
  for (var key in obj) {
    createNestedObject(settings, key, obj[key]);
  }
  // combine the interception settings for default and custom domains
  settings.interception.domains = [];
  if (isset(() => settings.interception.enabled.custom) && Array.isArray(settings.interception.enabled.custom)) {
    settings.interception.enabled.custom.forEach(function(element) {
      // only add active custom domains
      if (element.active) {
        settings.interception.domains.push(element);
      }
    });
    delete settings.interception.enabled.custom;
  }
  settings.interception.enabled.default.forEach(function(element) {
    // only add active default domains and only if there is no identical active custom domain
    if (element.active && !settings.interception.domains.find(function(element2){return element2.domain === element.domain;})) {
      settings.interception.domains.push(element);
    }
  });
  delete settings.interception.enabled.default;
  // combine the serach settings for custom and default search engines
  if (isset(() => settings.searchengines.custom) && Array.isArray(settings.searchengines.custom) && settings.searchengines.custom.length > 0) {
    settings.searchengines = settings.searchengines.default.concat(settings.searchengines.custom);
    delete settings.searchengines.custom;
  }
  else {
    settings.searchengines = settings.searchengines.default;
  }
  delete settings.searchengines.default;
  // some other settings tweaks
  settings.interception.allowEdit = settings.interception.enabled.allowEdit;
  settings.interception.enabled = settings.interception.enabled.enabled;
}

// function to initialize the script and the event listeners
function initializeScript() {

  // set "agreed" cookie for nzbindex.com
  browser.cookies.set({
    url: "https://nzbindex.com",
    domain: "nzbindex.com",
    name: "agreed",
    value: "true",
  });

  // remove all context menus
  debugLog.info("removing all context menus")();
  browser.contextMenus.removeAll();

  // setting the context menu for the 'Get NZB file' action
  debugLog.info("setting the context menu for the 'Get NZB file' action")();
  browser.contextMenus.create({
    title: browser.i18n.getMessage("extNZBGetNZBFile"),
    contexts: ["link", "selection"],
    id: contextMenuID + "_GetFile"
  });

  // setting the event listener for context menu clicks
  if (browser.contextMenus.onClicked.hasListener(events.contextMenuListener)) {
    debugLog.info("removing old event listener for the context menu clicks")();
    browser.contextMenus.onClicked.removeListener(events.contextMenuListener);
  }
  debugLog.info("setting event listener for the context menu clicks")();
  browser.contextMenus.onClicked.addListener(events.contextMenuListener);

  // setting the event listener for messages from the content or options script
  if (browser.runtime.onMessage.hasListener(events.messageListener)) {
    debugLog.info("removing old event listener for the messages from content or options script")();
    browser.runtime.onMessage.removeListener(events.messageListener);
  }
  debugLog.info("setting event listener for the messages from content or options script")();
  browser.runtime.onMessage.addListener(events.messageListener);

  // setting the event listener for settings changes
  if (browser.storage.onChanged.hasListener(startScript)) {
    debugLog.info("removing old event listener for changes to the settings")();
    browser.storage.onChanged.removeListener(startScript);
  }
  debugLog.info("setting event listener for changes to the settings")();
  browser.storage.onChanged.addListener(startScript);

  // if enabled in the settings, set up the nzb download interception
  if (settings.interception.enabled) {
    interception.setup();
  }

}

  // main backbone function of the script for nzb file search
  // to be called as soon as we have all information to start searching for the nzb files
  async function doTheDonkey(nzb) {
    nzb.log = nzbLog.newEntry();
    try {
      nzb.log.set("success", "");
      nzb.log.set("title", nzb.title);
      nzb.log.set("header", nzb.header);
      nzb.log.set("password", nzb.password);
      notification(browser.i18n.getMessage("NotificationSearchingFor", nzb.title), "info", nzb.log.id());
      nzb.log.set("status", browser.i18n.getMessage("StatusSearchingForNZB"));
      nzb = await nzbsearch.execute(nzb);
      nzb.log.set("status", browser.i18n.getMessage("StatusNZBFetched"));
      nzb = processTitle(nzb);
      nzb.log.set("title", nzb.title);
      nzb = await categories.set(nzb);
      nzb.log.set("category", nzb.category);
      nzb = addMetaDataToNZBfile(nzb);
      nzb.log.set("status", browser.i18n.getMessage("StatusPushingToTarget", browser.i18n.getMessage(settings.nzbtarget.type)));
      const response = await target[settings.nzbtarget.type].pushToTarget(nzb);
      nzb.log.set("success", "success");
      notification(response, "success", nzb.log.id());
      console.log(nzb.log.get("success"));
      console.log(nzbLog.get());
    }
    catch (e) {
      nzb.log.set("status", e.message);
      nzb.log.set("success", "error");
      console.log(nzbLog.get());
      errorHandler(e, nzb.log.id());
    }
  }

  // function to analyze the parameters passed from the content script
  function processAnalysedSelection(nzb) {
    debugLog.info("processing parameters passed from the content script")();
    if (nzb.header) {
      debugLog.info(`header set to: ${nzb.header}`)();
      nzb.title = nzb.title ? nzb.title : nzb.header;
      debugLog.info(`title set to: ${nzb.title}`)();
      nzb.password = nzb.password ? nzb.password : "";
      debugLog.info(`password set to: ${nzb.password}`)();
      return nzb;
    }
    else {
      throw new Error(browser.i18n.getMessage("ErrorMsgNoHeader"));
    }
  }

// function to process the clicked link
function processLink(nzblnk) {
  debugLog.info(`processing clicked link: ${nzblnk}`)();
  let url;
  const nzb = {};
  try {
    url = new URL(nzblnk);
  } catch (e) {
    throw new Error(browser.i18n.getMessage("ErrorNoNZBlnk"));
  }
  if (url.protocol === "nzblnk:") {
    if (url.searchParams.get("h")) {
      nzb.header = url.searchParams.get("h");
      debugLog.info(`found header parameter: ${nzb.header}`)();
      nzb.password = url.searchParams.get("p") ? url.searchParams.get("p") : "";
      debugLog.info(`found password parameter: ${nzb.password}`)();
      nzb.title = url.searchParams.get("t") ? url.searchParams.get("t") : nzb.header;
      debugLog.info(`found title parameter: ${nzb.title}`)();
      return nzb;
    } else {
      throw new Error(browser.i18n.getMessage("ErrorInvalidNZBlnkMissingHeader"));
    }
  } else {
    throw new Error(browser.i18n.getMessage("ErrorNoNZBlnk"));
  }
}

  // function to process the nzb title
  function processTitle(nzb) {
    if (settings.processing.processTitel.enabled) {
      debugLog.info("processing the nzb title")();
      // convert periods to spaces or vice versa
      switch (settings.processing.processTitel.type) {
        case "periods":
          nzb.title = nzb.title.replace(/\s/g, ".");
          break;
        case "spaces":
          nzb.title = nzb.title.replace(/\./g, " ");
          break;
      }
    }
    return nzb;
  }

  // function to add the meta data to the nzb file
  function addMetaDataToNZBfile(nzb) {
    debugLog.info("adding the meta data to the nzb file")();
    let nzbMetadata = "";
    if (isset(() => nzb.title) && nzb.title !== "" && settings.processing.addTitle) {
      nzbMetadata += `
    <meta type="title">${escapeXML(nzb.title)}</meta>`;
      debugLog.info(`nzb file meta data: title tag set to: ${nzb.title}`)();
    }
    if (isset(() => nzb.password) && nzb.password !== "" && settings.processing.addPassword) {
      nzbMetadata += `
    <meta type="password">${escapeXML(nzb.password)}</meta>`;
      debugLog.info(`nzb file meta data: password tag set to: ${nzb.password}`)();
    }
    if (isset(() => nzb.category) && nzb.category !== "" && settings.processing.addCategory) {
      nzbMetadata += `
    <meta type="category">${escapeXML(nzb.category)}</meta>`;
      debugLog.info(`nzb file meta data: category tag set to: ${nzb.category}`)();
    }
    if (nzbMetadata != "") {
      debugLog.info("adding the meta data to the nzb file")();
      if (nzb.file.match(/<head>/i)) {
        nzb.file = nzb.file.replace(/<head>/i,`<head>${nzbMetadata}`);
      }
      else {
        nzb.file = nzb.file.replace(/(<nzb.*?>)/i,
`$1
<head>${nzbMetadata}
</head>`);
      }
    }
    else {
      debugLog.info("no meta data to add to the nzb file")();
    }
    return nzb;
  }
