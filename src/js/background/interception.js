// functions for nzb file download interception
const interception = {};

// declare global variable to store the requests information
interception.ownRequestIDs = [];
interception.allRequestIDs = [];

// function to set up interception of nzb file downloads
interception.setup = () => {
  // removing old event listener for the onHeadersReceived event
  if (browser.webRequest.onHeadersReceived.hasListener(interception.onHeadersReceivedEventListener)) {
    debugLog.info("removing old event listener for the onHeadersReceived event")();
    browser.webRequest.onHeadersReceived.removeListener(interception.onHeadersReceivedEventListener);
  }
  // removing old event listener for the onBeforeRequest event
  if (browser.webRequest.onBeforeRequest.hasListener(interception.onBeforeRequestEventListener)) {
    debugLog.info("removing old event listener for the onBeforeRequest event")();
    browser.webRequest.onBeforeRequest.removeListener(interception.onBeforeRequestEventListener);
  }
  // removing old event listener for the onBeforeSendHeaders event
  if (browser.webRequest.onBeforeSendHeaders.hasListener(interception.onBeforeSendHeadersEventListener)) {
    debugLog.info("removing old event listener for the onBeforeSendHeaders event")();
    browser.webRequest.onBeforeSendHeaders.removeListener(interception.onBeforeSendHeadersEventListener);
  }

  // generate the array of domains to  be intercepted
  const Domains = [];
  if (isset(() => settings.interception.domains) && settings.interception.domains.length > 0) {
    for (let i = 0; i < settings.interception.domains.length; i += 1) {
      if (settings.interception.domains[i].active) {
        Domains.push(`*://*.${settings.interception.domains[i].domain}/*`);
      }
    }
  }
  // setting the event listener to intercept nzb file downloads
  debugLog.info("setting event listener for the onHeadersReceived event")();
  browser.webRequest.onHeadersReceived.addListener(interception.onHeadersReceivedEventListener, {
    urls: Domains,
  }, ["responseHeaders", "blocking"]);
  // setting the event listener for all requests to get the request url and form data to be used upon interception
  debugLog.info("setting event listener for the onBeforeRequest event")();
  browser.webRequest.onBeforeRequest.addListener(interception.onBeforeRequestEventListener, {
    urls: Domains,
  }, ["requestBody"]);
  // setting the event listener for the X-NZBDonkey requests to get those request IDs to exclude them from being intercepted
  debugLog.info("setting event listener for the onBeforeSendHeaders event")();
  browser.webRequest.onBeforeSendHeaders.addListener(interception.onBeforeSendHeadersEventListener, {
    urls: Domains,
  }, ["requestHeaders"]);
};

// function to handle form data as string
interception.sendFormDataAsString = (nzb, details) => {
  debugLog.info(`${analyzeURL(nzb.url).basedomain}: this domain requires special handling sendFormDataAsString`)();
  let formData = "";
  for (let key in interception.allRequestIDs[details.requestId].formData) {
    if (isset(() => interception.allRequestIDs[details.requestId].formData[key][0])) {
      formData += `${key}=${interception.allRequestIDs[details.requestId].formData[key][0]}&`;
    }
  }
  nzb.formData = formData.replace(/&$/i, "");
  return nzb;
};

// function to handle form data as GET
interception.sendFormDataAsGET = (nzb, details) => {
  debugLog.info(`${analyzeURL(nzb.url).basedomain}: this domain requires special handling sendFormDataAsGET`)();
  const parameters = {};
  const data = interception.allRequestIDs[details.requestId].formData;
  for (let key in data) {
    if (Array.isArray(data[key])) {
      if (/.*\[\]$/.test(key)) {
        parameters[key.match(/(.*)\[\]$/)[1]] = data[key];
      } else {
        parameters[key] = data[key][0];
      }
    } else {
      parameters[key] = data[key];
    }
  }
  nzb.parameters = parameters;
  return nzb;
};

// function to handle form data as POST
interception.sendFormDataAsPOST = (nzb, details) => {
  debugLog.info(`${analyzeURL(nzb.url).basedomain}: this domain requires special handling sendFormDataAsPOST`)();
  nzb.formData = generateFormData(interception.allRequestIDs[details.requestId].formData);
  return nzb;
};

// function to handle the onHeadersReceived event
interception.onHeadersReceivedEventListener = (details) => {
  // first check if it is not one of our own requests
  if (!interception.ownRequestIDs.includes(details.requestId)) {
    // get the headers
    const headers = details.responseHeaders;
    // loop through the headers
    for (let header of headers) {
      // check for header "Content-Disposition"
      if (/^content-disposition$/i.test(header.name)) {
        // check if header "Content-Disposition" contains a filename ending with .nzb
        if (/filename\s*=\s*"?((.*)\.nzb)"?/i.test(header.value)) {
          // if yes, we have a hit and will intercept this download
          let nzb = {};
          // get the filename as title
          nzb.title = header.value.match(/filename\s*=\s*"?((.*)\.nzb)"?/i)[2];
          debugLog.info(`found a nzb filename in the intercepted response header: ${nzb.title}`)();
          // check if the filename contains the password in {{}}
          if (/^(.*){{(.*?)}}/m.test(nzb.title)) {
            // if yes, set the password
            nzb.password = nzb.title.match(/^(.*){{(.*?)}}/m)[2];
            // and the title without the password
            nzb.title = nzb.title.match(/^(.*){{(.*?)}}/m)[1];
          } else {
            // if not, set the password to empty anyway to avoid undefined errors
            nzb.password = "";
          }
          // get the request url for this nzb file
          nzb.url = interception.allRequestIDs[details.requestId].url;
          // check if there is some formData for this request
          if (isset(() => interception.allRequestIDs[details.requestId].formData) && typeof interception.allRequestIDs[details.requestId].formData === "object") {
            debugLog.info("found post form data for intercepted nzb file request")();
            const currentDomain = settings.interception.domains.filter( (domain) => {
              return domain.domain === analyzeURL(nzb.url).basedomain;
            });
            // handle the Form Data according to the settings of the current domain, use sendFormDataAsPOST as default
            nzb = interception[currentDomain[0].handling || "sendFormDataAsPOST"](nzb, details);
          }
          // calling the function to take over the nzb file download
          interception.execute(nzb);
          // aborting original request
          return {
            redirectUrl: "javascript:void(0)",
          };
        }
      }
    }
  }
};

// function to handle the onBeforeRequest event
interception.onBeforeRequestEventListener = (details) => {
  interception.allRequestIDs[details.requestId] = {};
  // get the url of this request
  interception.allRequestIDs[details.requestId].url = details.url;
  // check if there is a request body
  if (isset(() => details.requestBody) && typeof details.requestBody === "object") {
    // check if the request body contains form data
    if (isset(() => details.requestBody.formData) && typeof details.requestBody.formData === "object") {
      // get the form data of this request
      interception.allRequestIDs[details.requestId].formData = details.requestBody.formData;
    }
  }
};

// function to handle the onBeforeSendHeaders event
interception.onBeforeSendHeadersEventListener = (details) => {
  // get the headers of this request
  const headers = details.requestHeaders;
  // loop through the headers
  for (let header of headers) {
    // if header name is X-NZBDonkey
    if (/^x-nzbdonkey$/i.test(header.name)) {
      // add request ID to the own requests ids
      interception.ownRequestIDs.push(details.requestId);
    }
  }
};

// main backbone function of the script for the nzb file download interception
// to be called as soon as we have all information to take over the nzb file download
interception.execute = async (nzb) => {
  nzb.log = nzbLog.newEntry();
  try {
    nzb.log.set("success", "");
    nzb.log.set("title", nzb.title);
    nzb.log.set("origin", browser.i18n.getMessage("OriginInterception", analyzeURL(nzb.url).domain));
    notification(browser.i18n.getMessage("NotificationInterceptingDownload", [nzb.title, analyzeURL(nzb.url).domain]), "info", nzb.log.id());
    const options = {
      url: nzb.url,
      responseType: "text",
      timeout: 120000,
      data: nzb.formData,
      parameters: nzb.parameters,
    };
    const response = await xhr(options);
    nzb.file = response;
    if (!checknzbfile.validity(nzb.file)) {
      throw new Error("the nzb file is invalid");
    }
// for debug
nzb.log.set("nzbfile", checknzbfile.completeness(nzb.file));

    nzb = processTitle(nzb);
    nzb.log.set("title", nzb.title);
    if (settings.category.enabled.enabled) {
      nzb = await categories.set(nzb);
    }
    if (settings.interception.allowEdit) {
      nzb = await editnzbinformation.execute(nzb);
    }
    nzb = addMetaDataToNZBfile(nzb);
    const responseMessage = await target[settings.nzbtarget.type].pushToTarget(nzb);
    nzb.log.set("success", "success");
    notification(responseMessage, "success", nzb.log.id());
    console.log(nzbLog.get());
  } catch (e) {
    nzb.log.set("status", e.message);
    nzb.log.set("success", "error");
    console.log(nzbLog.get());
    errorHandler(e, nzb.log.id());
  }
};
