// functions to search and download the nzb file
const nzbsearch = {};

// function to search and download the nzb file
nzbsearch.execute = async (nzb) => {
  try {
    debugLog.info('starting to search for the nzb file on the search engines')();
    // prepare the promises for all search engines
    let getNZB = []; // the promise array
    for (let i = 0; i < settings.searchengines.length; i += 1) {
      if (settings.searchengines[i].active) { // only use 'active' search engines
        getNZB[i] = nzbsearch.getNZB(nzb, i);
      }
    }
    // lets 'race' the promises and get the result from the first resolved promise
    const response = await Promise.any(getNZB);
    // resolve with the nzbFile
    nzb.file = response.nzbFile;
    nzb.log.set("origin", response.origin);
    debugLog.info(`${response.origin}: was the first search engine to return a valid nzb file`)();
    return nzb;
  } catch (e) {
    // if we have no results, reject
    throw new Error(browser.i18n.getMessage('ErrorNoUsableNZBFound'));
  }
};

nzbsearch.getNZB = async (nzb, i) => {
  const nzbSearchStartTime = Date.now();
  const log = {};
  try {
    const searchResult = await nzbsearch.search(nzb, i);
    const nzbID = nzbsearch.checkresponse[settings.searchengines[i].responseType](searchResult, i);
    const nzbFile = await nzbsearch.download(nzbID, i);
    debugLog.info(`${settings.searchengines[i].name}: checking validity of the nzb file`)();
    const nzbFileJSON = checknzbfile.validity(nzbFile);
    if (nzbFileJSON) {
      debugLog.info(`${settings.searchengines[i].name}: the nzb file is valid`)();
    } else {
      throw new Error("the nzb file is invalid");
    }
    if (settings.processing.fileCheck.enabled || settings.processing.segmentCheck.enabled) {
      debugLog.info(`${settings.searchengines[i].name}: testing the nzb file for completeness`)();
      log.nzbfile = checknzbfile.completeness(nzbFileJSON);
      debugLog.info(`${settings.searchengines[i].name}: files: [${log.nzbfile.filesTotal}/${log.nzbfile.filesExpected}] / segments: (${log.nzbfile.segmentsTotal}/${log.nzbfile.segmentsExpected})`)();
      if (log.nzbfile.error) {
        throw new Error(log.nzbfile.error);
      }
      debugLog.info(`${settings.searchengines[i].name}: the nzb file seems to be complete`)();
    }
    log.searchTime = (Date.now() - nzbSearchStartTime) / 1000;
    log.status = "complete nzb file found";
    nzb.log.set(settings.searchengines[i].name, log, "searchResults");
    debugLog.info(`${settings.searchengines[i].name}: found a valid nzb file after ${(Date.now() - nzbSearchStartTime) / 1000}ms`)();
    return {
      nzbFile: nzbFile,
      origin: settings.searchengines[i].name,
    };
  } catch (e) {
    log.searchTime = (Date.now() - nzbSearchStartTime) / 1000;
    log.status = `${browser.i18n.getMessage("error")}: ${e.message}`;
    nzb.log.set(settings.searchengines[i].name, log, "searchResults");
    debugLog.warn(`${settings.searchengines[i].name}: ${e.message}`)();
    debugLog.warn(`${settings.searchengines[i].name}: failed after ${(Date.now() - nzbSearchStartTime) / 1000}ms`)();
    throw e;
  }
};

nzbsearch.search = async (nzb, i) => {
  debugLog.info(`${settings.searchengines[i].name}: searching for the header`)();
  const nzbSearchURL = settings.searchengines[i].searchURL.replace(/%s/, encodeURI(nzb.header));
  debugLog.info(`${settings.searchengines[i].name}: the search url is: ${nzbSearchURL}`)();
  const options = {
    url: nzbSearchURL,
    responseType: "text",
    timeout: 30000,
  };
  try {
    const response = await xhr(options);
    debugLog.info(`${settings.searchengines[i].name}: the search engine returned a response`)();
    return response;
  } catch (e) {
    throw new Error(`an error occured while searching for the header: ${e.message}`);
  }
};

nzbsearch.checkresponse = {};

nzbsearch.checkresponse.html = (response, i) => {
  const re = new RegExp(settings.searchengines[i].searchPattern, 'i');
  debugLog.info(`${settings.searchengines[i].name}: the search engine is supposed to return a html response`)();
  debugLog.info(`${settings.searchengines[i].name}: searching for a nzb file id in the html response`)();
  debugLog.info(`${settings.searchengines[i].name}: search pattern is set to: ${settings.searchengines[i].searchPattern}`)();
  if (re.test(response)) {
    const nzbID = response.match(re)[settings.searchengines[i].searchGroup];
    debugLog.info(`${settings.searchengines[i].name}: found nzb file id "${nzbID}"`)();
    return nzbID;
  }
  throw new Error("no nzb file id found in the html response");
};

nzbsearch.checkresponse.json = (response, i) => {
  debugLog.info(`${settings.searchengines[i].name}: the search engine is supposed to return a JSON response`)();
  debugLog.info(`${settings.searchengines[i].name}: searching for a nzb file id in the JSON response`)();
  let nzbID = JSON.parse(response);
  const objectPath = settings.searchengines[i].searchPattern.split('.');
  for (let j = 0; j < objectPath.length; j += 1) {
    if (isset(() => nzbID[objectPath[j]])) {
      nzbID = nzbID[objectPath[j]];
    } else {
      throw new Error("no nzb file id found in the JSON response");
    }
  }
  debugLog.info(`${settings.searchengines[i].name}: found nzb file id "${nzbID}"`)();
  return nzbID;
};

nzbsearch.download = async (nzbID, i) => {
  debugLog.info(`${settings.searchengines[i].name}: downloading nzb file with id "${nzbID}"`)();
  const nzbDownloadURL = settings.searchengines[i].downloadURL.replace(/%s/, nzbID);
  debugLog.info(`${settings.searchengines[i].name}: the nzb file download url is: ${nzbDownloadURL}`)();
  const options = {
    url: nzbDownloadURL,
    responseType: 'text',
    timeout: 180000,
  };
  try {
    const response = await xhr(options);
    debugLog.info(`${settings.searchengines[i].name}: download request of nzb file with id "${nzbID}" resulted in a response`)();
    return response;
  } catch (e) {
    throw new Error(`an error occured while trying to download the nzb file with id "${nzbID}": ${e.message}`);
  }
};
