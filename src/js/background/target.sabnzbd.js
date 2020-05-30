// functions for nzb file target SABNzbd
target.sabnzbd = {};

// function for the connection options
target.sabnzbd.options = (timeout = 5000) => {
  let options = {
    scheme: settings.sabnzbd.scheme,
    host: settings.sabnzbd.host,
    port: settings.sabnzbd.port,
    path: "api",
    responseType: "text",
    timeout: timeout,
  };
  if (isset(() => settings.sabnzbd.basepath) && settings.sabnzbd.basepath != "") {
    options.basepath = settings.sabnzbd.basepath.match(/^\/*(.*?)\/*$/)[1] + "/";
  }
  if (isset(() => settings.sabnzbd.basicAuthUsername) && settings.sabnzbd.basicAuthUsername != "") {
    options.username = settings.sabnzbd.basicAuthUsername;
  }
  if (isset(() => settings.sabnzbd.basicAuthPassword) && settings.sabnzbd.basicAuthPassword != "") {
    options.password = settings.sabnzbd.basicAuthPassword;
  }
  return options;
};

// function to connect to sabnzbd
target.sabnzbd.connect = async (options) => {
  try {
    debugLog.info("connecting to SABnzbd")();
    const response = JSON.parse(await xhr(options));
    if (isset(() => response.status) && response.status) {
      debugLog.info("SABnzbd responded with a success code")();
      return response;
    } else if (isset(() => response.error)) {
      throw Error(response.error);
    } else {
      throw Error(browser.i18n.getMessage("unknownError"));
    }
  } catch (e) {
    debugLog.error(`error while connecting to sabnzbd: ${e.message}`)();
    e.message = `${browser.i18n.getMessage("ErrorWhileConnectinToTarget",browser.i18n.getMessage("sabnzbd"))}: ${e.message}`;
    throw e;
  }
};

// function to test the connection
target.sabnzbd.testconnection = async () => {
  debugLog.info("testing connection to SABnzbd")();
  let options = target.sabnzbd.options(5000);
  const formData = {
    mode: "addurl",
    output: "json",
    apikey: settings.sabnzbd.apiKey,
    name: "",
  };
  options.data = generateFormData(formData);
  await target.sabnzbd.connect(options);
  return browser.i18n.getMessage("SuccessWhileConnectinToTarget", browser.i18n.getMessage("sabnzbd"));
};

// function to get the categories
target.sabnzbd.getCategories = async () => {
  debugLog.info("getting categories from SABnzbd")();
  let options = target.sabnzbd.options(5000);
  const formData = {
    mode: "get_cats",
    output: "json",
    apikey: settings.sabnzbd.apiKey,
    name: ""
  };
  options.data = generateFormData(formData);
  const response = await target.sabnzbd.connect(options);
  if (isset(() => response.categories)) {
    let index = response.categories.indexOf("*");
    if (index > -1) {
      response.categories.splice(index, 1);
    }
  } else {
    response.categories = [];
  }
  return response.categories;
};

// function to push the nzb file to the target
target.sabnzbd.pushToTarget = async (nzb) => {
  debugLog.info("pushing the nzb file to SABnzbd")();
  nzb.log.set("status", browser.i18n.getMessage("StatusPushingToTarget", browser.i18n.getMessage("sabnzbd")));
  let options = target.sabnzbd.options(180000);
  const content = new Blob([nzb.file], {
    type: "text/xml"
  });
  let filename = nzb.title;
  if (isset(() => nzb.password) && nzb.password !== "") {
    filename += "{{" + nzb.password + "}}";
  }
  const addPaused = (settings.sabnzbd.addPaused) ? -2 : -100;
  const formData = {
    mode: "addfile",
    output: "json",
    apikey: settings.sabnzbd.apiKey,
    nzbname: filename,
    cat: nzb.category,
    priority: addPaused,
    name: [content, filename]
  };
  options.data = generateFormData(formData);
  await target.sabnzbd.connect(options);
  debugLog.info("the nzb file was successfully pushed to SABnzbd")();
  nzb.log.set("status", browser.i18n.getMessage("StatusPushedToTarget", browser.i18n.getMessage("sabnzbd")));
  return browser.i18n.getMessage("SuccessWhilePushingToTarget", [nzb.title, browser.i18n.getMessage("sabnzbd")]);
};
