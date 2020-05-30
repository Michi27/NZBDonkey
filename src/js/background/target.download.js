// functions for nzb file target browser download folder
target.download = {};

// function to push the nzb file to the target
target.download.pushToTarget = (nzb) => {
  return new Promise((resolve, reject) => {
    let filename = "";
    let passwordWarning = false;
    debugLog.info("start preparing to save the nzb file in the download folder")();
    nzb.log.set("status", browser.i18n.getMessage("StatusDownloading"));
    if (settings.download.defaultPath !== "") {
      filename += settings.download.defaultPath.replace(/^[\\/]*(.*)[\\/]*$/, "$1") + "/";
    }
    if (isset(() => nzb.category) && nzb.category !== "" && settings.download.categoryFolder) {
      filename += `${nzb.category.replace(/[\\/?%*:|"<>\r\n\t\0\v\f\u200B]/g, "")}/`;
    }
    filename += nzb.title.replace(/[\\/?%*:|"<>\r\n\t\0\v\f\u200B]/g, "");
    if (isset(() => nzb.password) && nzb.password !== "") {
      if (!/[\\/?%*:|"<>\r\n\t\0\v\f\u200B]/.test(nzb.password)) {
        filename += `{{${nzb.password}}}`;
      } else {
        debugLog.warn("the Password contains invalid characters and cannot be included in the filename")();
        passwordWarning = `${browser.i18n.getMessage("caution")}: ${browser.i18n.getMessage("DownloadPasswordSaveWarning")}`;
      }
    }
    filename += ".nzb";
    debugLog.info(`filename is set to: ${filename}`)();
    const blob = new Blob([nzb.file], {
      type: "text/nzb;charset=utf-8",
    });
    browser.downloads.download({
        conflictAction: "uniquify",
        filename: filename,
        saveAs: settings.download.saveAs,
        url: URL.createObjectURL(blob),
      })
      .then((id) => {
        if (typeof id === "undefined") {
          debugLog.info("failed to initiate the download to the download folder")();
          reject(new Error(browser.runtime.lastError.message));
        } else {
          debugLog.info(`initiated the download to the download folder with download id "${id}"`)();
          notification(browser.i18n.getMessage("NotificationStartingDownload", filename), "info", nzb.log.id());
        }
      });
    browser.downloads.onChanged.addListener((details) => {
      if (isset(() => details.state.current)) {
        if (details.state.current === "complete") {
          debugLog.info("download to the download folder completed")();
          nzb.log.set("status", browser.i18n.getMessage("StatusDownloaded"));
          let notificationString = browser.i18n.getMessage("SuccessSavingNZBFile", filename);
          if (isset(() => passwordWarning)) {
            notificationString += "\n" + passwordWarning;
          }
          URL.revokeObjectURL(blob);
          resolve(notificationString);
        } else if (details.state.current === "interrupted") {
          URL.revokeObjectURL(blob);
          if (isset(() => details.error.current)) {
            if (details.error.current.match(/^user/i)) {
              debugLog.info("download cancelled by the user")();
              reject(new Error(browser.i18n.getMessage("DownloadCancelled", filename)));
            } else if (details.error.current.match(/^file/i)) {
              debugLog.info("file error while saving the nzb file to disk")();
              reject(new Error(browser.i18n.getMessage("ErrorSavingNZBFile", filename)));
            } else {
              debugLog.info("unknown error while downloading the nzb file to the download folder")();
              reject(new Error(browser.i18n.getMessage("ErrorSavingNZBFile", filename)));
            }
          } else {
            debugLog.info("unknown error while downloading the nzb file to the download folder")();
            reject(new Error(browser.i18n.getMessage("ErrorSavingNZBFile", filename)));
          }
        }
      }
    });
  });
};
