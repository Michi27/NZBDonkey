// helper functions

// function for error handling
function errorHandler(e, id = false) {
  let errorMessage;
  if (e instanceof Error) {
    debugLog.error(errorMessage = e.message)();
    console.error(e);
  } else {
    debugLog.error(errorMessage = e)();
  }
  notification(`${browser.i18n.getMessage("error")}: ${errorMessage}`, "error", id);
}

// function to show the desktop notification
function notification(message, type = "info", id = false) {
  if (type === "error" || settings.general.showNotifications === "info" || settings.general.showNotifications === type) {
    let title = browser.i18n.getMessage("extName");
    let notificationID = "NZBDonkey_notification";
    if (id) {
      title += ` - #${id}`;
      notificationID += `_${id}`;
    }
    const iconURL = {
      info: "icons/NZBDonkey_128.png",
      error: "icons/NZBDonkey_error_128.png",
      success: "icons/NZBDonkey_success_128.png",
    };
    debugLog.info(`sending desktop notification (ID = ${id}): ${message}`)();
    browser.notifications.create(notificationID, {
      type: "basic",
      iconUrl: iconURL[type],
      title: title,
      message: message,
    });
  }
}

/**
 * xhr
 *
 * Creats an xhr request.
 *
 * Async function which creates an xhr request and returns
 * a promise resolving to the result of the xhr request
 *
 * @param {object|string}   options                 Either the options for the xhr request or directly the url.
 * @param {string}          [options.url]           Url for the xhr request.
 * @param {string}          [options.scheme]        Scheme for constructiong the url for the xhr request.
 * @param {string}          [options.username]      Username for constructiong the url for the xhr request.
 * @param {string}          [options.password]      Password for constructiong the url for the xhr request.
 * @param {string}          [options.host]          Host for constructiong the url for the xhr request.
 * @param {string}          [options.port]          Port for constructiong the url for the xhr request.
 * @param {string}          [options.basepath]      Basepath for constructiong the url for the xhr request.
 * @param {string}          [options.path]          Path for constructiong the url for the xhr request.
 * @param {object}          [options.parameters]    Object with key/value pairs for the GET parameters for constructiong the url for the xhr request.
 * @param {*}               [options.data]          Data to be sent as POST xhr request. Usually a FormData object.
 * @param {string}          [options.responseType]  Response type of the xhr request.
 * @param {!number}         [options.timeout=10000] Timeout value for the xhr request.
 *
 * @return {promise} Returns a promise resolving to the result of the xhr request.
 */
function xhr(options) {
  return new Promise((resolve, reject) => {
    const url = createURL(options);
    const method = options.data ? "POST" : "GET";
    const request = new XMLHttpRequest();
    if (options.responseType && typeof options.responseType === "string") {
      request.responseType = options.responseType;
    }
    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          let errorMsg = browser.i18n.getMessage("ServerErrorCode", request.status.toString());
          if (request.statusText) {
            errorMsg += ` (${request.statusText})`;
          }
          reject(new Error(errorMsg));
        }
      }
    };
    request.onerror = function () {
      reject(new Error(browser.i18n.getMessage("ServerErrorUnknown")));
    };
    request.ontimeout = function () {
      reject(new Error(browser.i18n.getMessage("ServerErrorTimeOut")));
    };
    request.open(method, url, true);
    if (options.username && options.password) {
      request.setRequestHeader("Authorization", "Basic " + b64EncodeUnicode(`${options.username}:${options.password}`));
    }
    request.timeout = options.timeout ? options.timeout : 10000;
    request.setRequestHeader("X-NZBDonkey", true);
    request.send(options.data);
  });
}

/**
 * createURL
 *
 * Creats an url.
 *
 * Function which creates an url.
 *
 * @param {object|string}   options                 Either the options for the url or directly the url.
 * @param {string}          [options.url]           The url.
 * @param {string}          [options.scheme]        Scheme for the url.
 * @param {string}          [options.host]          Host for the url.
 * @param {string}          [options.port]          Port for the url.
 * @param {string}          [options.basepath]      Basepath the url.
 * @param {string}          [options.path]          Path for the url.
 * @param {object}          [options.parameters]    Object with key/value pairs for the GET parameters for the url.
 *
 * @return {string} Returns the url as an uri encoded string.
 */
function createURL(options) {
  let url;
  if (typeof options === "string") {
    try {
      url = new URL(options);
    } catch (e) {
      throw new Error("no valid URL");
    }
  } else if (options.url && typeof options.url === "string") {
    try {
      url = new URL(options.url);
    } catch (e) {
      throw new Error("no valid URL");
    }
  } else {
    url = new URL("http://localhost");
  }
  if (options.host && typeof options.host === "string") {
    url.hostname = options.host.match(/^(?:.*?:\/\/)?([^/:]+)/i)[1];
  }
  if (options.port && Number.isInteger(Number.parseInt(options.port, 10))) {
    url.port = Number.parseInt(options.port, 10);
  }
  if (options.basepath && typeof options.basepath === "string") {
    url.pathname = options.basepath.replace(/^\/+|\/+$/g, "");
  }
  if (options.path && typeof options.path === "string") {
    if (url.pathname !== "/") {
      url.pathname += "/";
    }
    url.pathname += options.path.replace(/^\/+|\/+$/g, "");
  }
  if (options.parameters) {
    const queryString = Object.keys(options.parameters)
      .map((key) => {
        if (Array.isArray(options.parameters[key])) {
          return Object.keys(options.parameters[key])
            .map(key2 => `${key}=${options.parameters[key][key2]}`)
            .join("&");
        } else {
          return `${key}=${options.parameters[key]}`;
        }
      })
      .join("&");
    url.search += url.search === "" ? `?${queryString}` : `&${queryString}`;
  }
  if (options.scheme && typeof options.scheme === "string") {
    url.protocol = options.scheme.match(/[a-z\d-]+/i)[0].toLowerCase();
  }
  return url.href;
}

// function to generate the form Data
function generateFormData(data) {
  const formData = new FormData();
  if (typeof data === "object") {
    for (let key in data) {
      if (Array.isArray(data[key])) {
        if (/.*\[\]$/.test(key)) {
          for (let i = 0; i < data[key].length; i += 1) {
            formData.append(key, data[key][i].toString());
          }
        } else {
          if (data[key].length === 1) {
            formData.append(key, data[key][0]);
          } else if (data[key].length === 2) {
            formData.append(key, data[key][0], data[key][1]);
          }
        }
      } else {
        formData.append(key, data[key]);
      }
    }
  }
  return formData;
}

// function to analyze an URL
function analyzeURL(u) {
  const url = {};
  const mapping = [
    {href: false},
    {scheme: true},
    {username: true},
    {password: true},
    {domain: true},
    {port: true},
    {fullpath: true},
    {path: true},
    {filename: true},
    {query: false},
    {hashtag: true},
  ];
  u.match(/(?:([^:]*):(?:\/){0,2})?(?:([^:@]*)(?::([^@]*))?@)?((?:(?:[^/:?]*)\.(?=[^./:?]*\.[^./:?]*))?(?:[^./:?]*)(?:\.(?:[^/.:]*))?)(?::([0-9]*))?(([/]?[^?#]*(?=.*?\/)\/)?([^/?#]*)?)(?:\?([^#]*))?(?:#(.*))?/)
    .map((value, index) => {
      if (value) {
        const [[name, decode]] = Object.entries(mapping[index]);
        url[name] = decode ? decodeURIComponent(value.replace(/\+/g, "%20")) : value;
      }
    });
  if (url.domain && url.domain.match(/(?:[^.]*\.)?[^.]*$/)) {
    url.basedomain = url.domain.match(/(?:[^.]*\.)?[^.]*$/)[0];
  }
  if (url.query) {
    url.parameters = {}
    url.query.split("&").map((value) => {url.parameters[decodeURIComponent(value.split("=")[0].replace(/\+/g, "%20"))] = decodeURIComponent(value.split("=")[1].replace(/\+/g, "%20"))});
    url.search = `?${url.query}`;
  }
  // add URL object compatible types
  // host & hostname
  if (url.domain) {
    url.host = url.domain;
    url.hostname = url.domain;
    if (url.port) {
      url.host += `:${url.port}`;
    }
  }
  // protocol
  if (url.scheme) {
    url.protocol = `${url.scheme}:`;
  }
  // hash
  if (url.hashtag) {
    url.hash = `#${url.hashtag}`;
  }
  // searchParams
    url.searchParams = new URLSearchParams(url.search);
  // pathname
  if (url.fullpath) {
    url.pathname = url.fullpath;
  }
  return url;
}

// Replace the plus sign which encode spaces in GET parameters.
function decodeUrlParameter(str) {
  return decodeURIComponent((str.toString())
    .replace(/\+/g, "%20"));
}

// function for correct btoa encoding for utf8 strings
// from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str)
    .replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
}

// function to escape xml special characters
function escapeXML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
  ;
}

// error proof function to check if nested objects are set without throwing an error if parent object is undefined
// from https://stackoverflow.com/questions/2281633/javascript-isset-equivalent/2281671
// call it: isset(() => variable.to.be.checked)
/**
 * Checks to see if a value is set.
 *
 * @param {Function} accessor Function that returns our value
 */
function isset(accessor) {
  try {
    // Note we're seeing if the returned value of our function is not
    // undefined
    return typeof accessor() !== "undefined";
  } catch (e) {
    // And we're able to catch the Error it would normally throw for
    // referencing a property of undefined
    return false;
  }
}