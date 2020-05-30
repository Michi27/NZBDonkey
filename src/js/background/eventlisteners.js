// functions to handle the events
const events = {};

// function to handle the text selection event
events.selectionText = async (tab) => {
  debugLog.info("NZBDonkey was started with a right click on a selection")();
  debugLog.info("analyzing selection")();
  let nzb = await browser.tabs.sendMessage(tab.id, {
    action: "analyzeSelection",
  });
  if (!isset(() => nzb.cancel)) {
    debugLog.info("analysis of selection finished")();
    nzb = processAnalysedSelection(nzb);
    await doTheDonkey(nzb);
  } else {
    debugLog.info("analyzing of selection was cancelled")();
  }
};

// function to handle the click on an url event
events.linkUrl = async (request) => {
  debugLog.info("NZBDonkey was started with a click on a link")();
  let nzb = processLink(request.linkUrl);
  await doTheDonkey(nzb);
};

// function to handle request for catch left links clicks event
events.catchLinks = (request) => {
  debugLog.info("content script has asked whether to catch left clicks on NZBlnk links")();
  debugLog.info(`catch left clicks on NZBlnk links is set to: ${settings.general.catchLinks}`)();
  return {
    catchLinks: settings.general.catchLinks,
  };
};

// function to handle the request for testing the connection event
events.testConnection = async (request) => {
  debugLog.info("options script has asked to test the connection to the current nzbTarget")();
  try {
    const response = await target[settings.nzbtarget.type].testconnection();
    return {
      success: true,
      response: response,
    };
  } catch (e) {
    return {
      success: false,
      response: e.message,
    };
  }
};

// function to handle the request for the log event
events.getLog = (request) => {
  debugLog.info("NZBDonkey log sent to popup.js")();
  return { 
      logs: nzbLog.get(),
    };
};

// function to handle the request for the debug log event
events.getDebugLog = (request) => {
  debugLog.info("NZBDonkey debug log sent to popup.js")();
  return {
    debugLog: debugLog.get(),
  };
};

// function to handle the request for sending the categories event
events.getTargetCategories = async (request) => {
  debugLog.info("options script has asked to send the categories for the current nzbTarget")();
  if (isset(() => target[settings.nzbtarget.type].getCategories)) {
    try {
      const categories = await target[settings.nzbtarget.type].getCategories();
      debugLog.info("categories sent to options script")();
      return {
        categories: categories,
      };
    } catch (e) {
      return {
        error: e.message,
      };
    }
  } else {
    debugLog.info("current nzbTarget does not support categories")();
    return {
      error: browser.i18n.getMessage("NotificationNoSupportForCategories"),
    };
  }
};

// function to handle error event
events.errorHandler = (request) => {
  errorHandler(request.error, "message");
  return Promise.resolve();
};

// functions to set the event listener for the context menu event
events.contextMenuListener = async (info, tab) => {
  try {
    // if the context menu was clicked on a selection
    if (isset(() => info.selectionText)) {
      await events.selectionText(tab);
    }
    // if the context menu was clicked on a link
    else if (isset(() => info.linkUrl)) {
      await events.linkUrl(info);
    // if neither of above has happened
    } else {
      throw new Error(browser.i18n.getMessage("NotificationRightClickWrongStart"));
    }
  } catch (e) {
    errorHandler(e);
  }
}

// function to set the event listener for messages from the content, options or popup script
events.messageListener = async (request) => {
  try {
    if (isset(() => events[request.action])) {
        debugLog.info(`received a request with action: ${request.action}`)();
        return await events[request.action](request);
    } else {
        debugLog.warn(`received an unknown request with action: ${request.action}`)();
        return Promise.resolve();
    }
  } catch (e) {
    errorHandler(e);
  }
};
