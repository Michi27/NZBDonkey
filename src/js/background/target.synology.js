// functions for nzb file target Synology Downloadstation
target.synology = {};

// function for the basic options for the connection
target.synology.baseOptions = (timeout = 5000) => {
  let options = {
    scheme: settings.synology.scheme,
    host: settings.synology.host,
    port: settings.synology.port,
    basepath: "webapi/",
    responseType: "text",
    timeout: timeout,
  };
  if (isset(() => settings.synology.basepath) && settings.sabnzbd.basepath != "") {
    options.basepath = settings.synology.basepath.match(/^\/*(.*?)\/*$/)[1] + "/" + options.basepath;
  }
  if (isset(() => settings.synology.basicAuthUsername) && settings.synology.basicAuthUsername != "") {
    options.username = settings.synology.basicAuthUsername;
  }
  if (isset(() => settings.synology.basicAuthPassword) && settings.synology.basicAuthPassword != "") {
    options.password = settings.synology.basicAuthPassword;
  }
  return options;
};

// function for the options for the query connection
target.synology.queryOptions = (options) => {
  options.path = "query.cgi";
  options.parameters = {
    api: "SYNO.API.Info",
    version: 1,
    method: "query",
    query: "SYNO.API.Auth,SYNO.DownloadStation2.Task",
  };
  return options;
};

// function for the options for the login connection
target.synology.loginOptions = (options, synoData) => {
  options.path = synoData.data['SYNO.API.Auth'].path;
  options.parameters = {
    api: "SYNO.API.Auth",
    version: synoData.data['SYNO.API.Auth'].maxVersion,
    method: "login",
    account: settings.synology.username,
    passwd: settings.synology.password,
    session: (~~(Math.random() * 1e9)).toString(36),
    format: "sid",
  };
  return options;
};

// function to connect to the Synology Downloadstation
target.synology.connect = async (options) => {
  try {
    debugLog.info("connecting to the the Synology DownloadStation")();
    const synoData = JSON.parse(await xhr(options));
    if (isset(() => synoData.success)) {
      debugLog.info("Synology Downloadstation responded with a success code")();
      return synoData;
    } else if (isset(() => synoData.error.code)) {
      throw Error(synoData.error.code);
    } else {
      throw Error(browser.i18n.getMessage('unknownError'));
    }
  } catch (e) {
    debugLog.error(`error while connecting to Synology DownloadStation: ${e.message}`)();
    e.message = `${browser.i18n.getMessage("ErrorWhileConnectinToTarget",browser.i18n.getMessage("synology"))}: ${e.message}`;
    throw e;
  }
};

// function to authenticate with Synology Diskstation
target.synology.authenticate = async () => {
  debugLog.info("authenticating with the Synology DownloadStation")();
  let options = target.synology.baseOptions(5000);
  options = target.synology.queryOptions(options);
  let synoData = await target.synology.connect(options);
  options = target.synology.loginOptions(options, synoData);
  let synoDataAuth = await target.synology.connect(options);
  synoData.data.sid = synoDataAuth.data.sid;
  debugLog.info(`successfully authenticated with the Synology DownloadStation with sid: ${synoData.data.sid}`)();
  return synoData;
};

// function to test the connection
target.synology.testconnection = async () => {
  debugLog.error("testing connection to Synology DownloadStation")();
  await target.synology.authenticate();
  return browser.i18n.getMessage('SuccessWhileConnectinToTarget', browser.i18n.getMessage('synology'));
};

// function to push the nzb file to the target
target.synology.pushToTarget = async (nzb) => {
  debugLog.info("pushing the nzb file to Synology DownloadStation")();
  nzb.log.set("status", browser.i18n.getMessage('StatusPushingToTarget', browser.i18n.getMessage('synology')));
  const synoData = await target.synology.authenticate();
  options.path = synoData.data['SYNO.DownloadStation2.Task'].path;
  delete options.parameters;
  const content = new Blob([nzb.file], {
    type: "text/xml"
  });
  const formData = {
    "api": "SYNO.DownloadStation2.Task",
    "method": "create",
    "version": synoData.data['SYNO.DownloadStation2.Task'].maxVersion,
    "type": "\"file\"",
    "destination": "\"\"",
    "create_list": false,
    "mtime": Date.now(),
    "size": content.size,
    "file": "[\"torrent\"]",
    "extract_password": '"' + nzb.password + '"',
    "_sid": synoData.data.sid,
    "torrent": [content, nzb.title + ".nzb"],
  };
  options.data = generateFormData(formData);
  options.timeout = 180000;
  await target.synology.connect(options);
  debugLog.info("the nzb file was successfully pushed to Synology DownloadStation")();
  nzb.log.set("status", browser.i18n.getMessage('StatusPushedToTarget', browser.i18n.getMessage('synology')));
  return browser.i18n.getMessage('SuccessWhilePushingToTarget', [nzb.title, browser.i18n.getMessage('synology')]);
};
