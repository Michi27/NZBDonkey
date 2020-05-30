// functions for nzb file target NZBGet
target.nzbget = {};

// function for the connection options
target.nzbget.options = (timeout = 5000) => {
  let options = {
    scheme: settings.nzbget.scheme,
    host: settings.nzbget.host,
    port: settings.nzbget.port,
    username: settings.nzbget.username,
    password: settings.nzbget.password,
    path: "jsonrpc/",
    responseType: "text",
    timeout: timeout,
  };
  if (isset(() => settings.nzbget.basepath) && settings.nzbget.basepath != "") {
    options.basepath = settings.nzbget.basepath.match(/^\/*(.*?)\/*$/)[1] + "/";
  }
  return options;
};

// function to connect with NZBGet
target.nzbget.connect = async (options) => {
  try {
    debugLog.info("connecting to NZBGet")();
    const response = JSON.parse(await xhr(options));
    if (isset(() => response.result)) {
      debugLog.info("NZBGet responded with a success code")();
      return response.result;
    } else {
      if (isset(() => response.error)) {
        throw new Error(`${response.error.code} - ${response.error.message}`);
      } else {
        throw new Error(browser.i18n.getMessage('unknownError'));
      }
    }
  } catch (e) {
    debugLog.error(`error while connecting to nzbget: ${e.message}`)();
    e.message = `${browser.i18n.getMessage("ErrorWhileConnectinToTarget",browser.i18n.getMessage("nzbget"))}: ${e.message}`;
    throw e;
  }
};

// function to test the connection
target.nzbget.testconnection = async () => {
  debugLog.info("testing connection to NZBGet")();
  const cookies = await browser.cookies.getAll({
    domain: settings.nzbget.host,
  });
  // first remove all cookies set by NZBGet to get a real test if connection is possible
  for (let i = 0; i < cookies.length; i++) {
    browser.cookies.remove({
      url: settings.nzbget.scheme + "://" + settings.nzbget.host + cookies[i].path,
      name: cookies[i].name,
    });
  }
  let options = target.nzbget.options(5000);
  options.data = JSON.stringify({
    version: "1.1",
    id: 1,
    method: "version",
  });
  await target.nzbget.connect(options);
  return browser.i18n.getMessage('SuccessWhileConnectinToTarget', browser.i18n.getMessage('nzbget'));
};

// function to get the categories
target.nzbget.getCategories = async () => {
  debugLog.info("getting the categories from NZBGet")();
  let options = target.nzbget.options(5000);
  options.data = JSON.stringify({
    version: "1.1",
    id: 1,
    method: "config"
  });
  const response = await target.nzbget.connect(options);
  var categories = [];
  response.forEach(function (element) {
    if (element.Name.match(/^category\d+\.name$/i)) {
      categories.push(element.Value);
    }
  });
  return categories;
};

// function to push the nzb file to the target
target.nzbget.pushToTarget = async (nzb) => {
  debugLog.info("pushing the nzb file to NZBGet")();
  nzb.log.set("status", browser.i18n.getMessage('StatusPushingToTarget', browser.i18n.getMessage('nzbget')));
  let options = target.nzbget.options(180000);
  const params = [
    nzb.title, // Filename
    b64EncodeUnicode(nzb.file), // Content (NZB File)
    nzb.category, // Category
    0, // Priority
    false, // AddToTop
    settings.nzbget.addPaused, // AddPaused
    "", // DupeKey
    0, // DupeScore
    "Force", // DupeMode
    [{
        "*Unpack:Password": nzb.password
      } // Post processing parameter: Password
    ]
  ];
  options.data = JSON.stringify({
    version: "1.1",
    id: 1,
    method: "append",
    params: params
  });
  await target.nzbget.connect(options);
  debugLog.info("the nzb file was successfully pushed to NZBGet")();
  nzb.log.set("status", browser.i18n.getMessage('StatusPushedToTarget', browser.i18n.getMessage('nzbget')));
  return browser.i18n.getMessage('SuccessWhilePushingToTarget', [nzb.title, browser.i18n.getMessage('nzbget')]);
};
