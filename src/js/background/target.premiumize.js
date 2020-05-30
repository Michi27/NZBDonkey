// functions for nzb file target premiumize.me
target.premiumize = {};

// function for the connection options
target.premiumize.options = (timeout = 5000, basepath = "api/account/info") => {
  let options = {
    scheme: "https",
    host: "www.premiumize.me",
    basepath: basepath,
    responseType: "text",
    timeout: timeout,
  };
  options.data = new FormData();
  options.data.append("customer_id", settings.premiumize.username);
  options.data.append("pin", settings.premiumize.password);
  return options;
};

// function to connect to premiumize.me
target.premiumize.connect = async (options) => {
  try {
    debugLog.info("connecting to premiumize.me")();
    const response = JSON.parse(await xhr(options));
    if (isset(() => response.status)) {
      if (response.status === "success") {
        debugLog.info("premiumize.me responded with a success code")();
        return response;
      } else if (response.status === "error") {
        throw Error(response.message);
      }
    } else {
      throw Error(browser.i18n.getMessage('unknownError'));
    }
  } catch (e) {
    debugLog.error(`error while connecting to premiumize.me: ${e.message}`)();
    e.message = `${browser.i18n.getMessage("ErrorWhileConnectinToTarget",browser.i18n.getMessage("premiumize"))}: ${e.message}`;
    throw e;
  }
};

// function to test the connection
target.premiumize.testconnection = async () => {
  debugLog.info("testing connection to to premiumize.me Downloader")();
  const cookies = await browser.cookies.getAll({
    domain: settings.premiumize.host
  });
  // first remove all cookies set by premiumize.me to get a real test if connection is possible
  for (let i = 0; i < cookies.length; i++) {
    browser.cookies.remove({
      url: settings.premiumize.scheme + "://" + settings.premiumize.host + cookies[i].path,
      name: cookies[i].name
    });
  }
  const options = target.premiumize.options(5000, "api/account/info");
  const response = await target.premiumize.connect(options);
  let responseMessage = browser.i18n.getMessage('SuccessWhileConnectinToTarget', browser.i18n.getMessage('premiumize')) + "<br>";
  if (response.premium_until) {
    const date = new Date(response.premium_until * 1000);
    responseMessage += browser.i18n.getMessage('PremiumizePremiumStatus') + ": " + browser.i18n.getMessage('PremiumizePremiumStatusValidTill') + " " + date.toLocaleDateString() + "<br>";
    const points = 1000 - (response.limit_used * 1000);
    responseMessage += browser.i18n.getMessage('PremiumizePremiumFairUsePoints') + ": " + Math.round(points * 10) / 10;
  } else {
    responseMessage += browser.i18n.getMessage('PremiumizePremiumStatus') + ": " + browser.i18n.getMessage('PremiumizePremiumStatusInactive');
  }
  return (responseMessage);
};

// function to push the nzb file to the target
target.premiumize.pushToTarget = async (nzb) => {
  debugLog.info("pushing the nzb file to premiumize.me")();
  nzb.log.set("status", browser.i18n.getMessage('StatusPushingToTarget', browser.i18n.getMessage('premiumize')));
  const src = new Blob([nzb.file], {
    type: "application/octet-stream"
  });
  let options = target.premiumize.options(5000, "api/transfer/create");
  options.data.append("password", nzb.password);
  options.data.append('src', src, nzb.title + '.nzb');
  await target.premiumize.connect(options);
  debugLog.info("the nzb file was successfully pushed to premiumize.me")();
  nzb.log.set("status", browser.i18n.getMessage('StatusPushedToTarget', browser.i18n.getMessage('premiumize')));
  return browser.i18n.getMessage('SuccessWhilePushingToTarget', [nzb.title, browser.i18n.getMessage('premiumize')]);
};
