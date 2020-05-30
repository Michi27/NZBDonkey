// function to prompt the user with a popup to allow editing of title, password and category
const editnzbinformation = {};

editnzbinformation.execute = async (nzb) => {
  const win = await browser.windows.getCurrent();
  const width = 540;
  const height = 540;
  const left = ((win.width / 2) - (width / 2)) + win.left;
  const top = ((screen.height / 2) - (height / 2));
  const window = await browser.windows.create({
    url: "/html/popups/editnzbinformation.html",
    width: width,
    height: height,
    top: Math.round(top),
    left: Math.round(left),
    type: "popup",
  });
  const windowId = window.id;
  debugLog.info(`opened popup window with id ${windowId} for manual editing of title, password and category`)();
  const waitForPopup = new Promise((resolve, reject) => {
    // onRemoveWindowListener function
    const onRemoveWindowListener = (winId) => {
      if (windowId == winId) {
        debugLog.info(`popup window with id ${windowId} for manual editing of title, password and category was closed before sending a message`)();
        reject(new Error(browser.i18n.getMessage("InterceptionCancelled", nzb.title)));
      }
    };
    // onConnectListener function
    const onConnectListener = (port) => {
      if (port.name === `editPopup_${windowId}`) {
        port.onMessage.addListener(async (response) => {
          if (response.windowId === windowId) {
            if (response.ready) {
              debugLog.info(`received ready message from popup window with id ${port.sender.tab.windowId}`)();
              debugLog.info(`sending information to popup window with id ${port.sender.tab.windowId} for manual editing of title, password and category`)();
              let postMessage = {
                title: nzb.title,
                password: nzb.password,
                id: nzb.log.id(),
                windowId: windowId,
              };
              if (settings.category.enabled.enabled) {
                postMessage.category = nzb.category;
                try {
                  postMessage.categories = await categories.targetCategories.all();
                } catch (e) {
                  errorHandler(e, nzb.log.id());
                  postMessage.categories = [];
                }
              }
              port.postMessage(postMessage);
            } else if (response.submit === true) {
              debugLog.info(`received feedback message from popup window with id ${port.sender.tab.windowId}`)();
              port.onMessage.removeListener(this);
              browser.windows.onRemoved.removeListener(onRemoveWindowListener);
              browser.runtime.onConnect.removeListener(onConnectListener);
              browser.windows.remove(windowId);
              if (nzb.title !== response.title) {
                nzb.title = response.title;
                nzb.log.set("title", response.title);
                debugLog.info(`title set by user to: ${nzb.title}`)();
              }
              if (nzb.password !== response.password) {
                nzb.password = response.password;
                nzb.log.set("password", response.password);
                debugLog.info(`password set by user to: ${nzb.password}`)();
              }
              if (nzb.category !== response.category) {
                nzb.category = response.category;
                nzb.log.set("category", response.category);
                debugLog.info(`category set by user to: ${nzb.category}`)();
              }
              resolve(nzb);
            } else {
              debugLog.info(`received cancelled message from popup window with id ${port.sender.tab.windowId}`)();
              port.onMessage.removeListener(this);
              browser.windows.onRemoved.removeListener(onRemoveWindowListener);
              browser.runtime.onConnect.removeListener(onConnectListener);
              browser.windows.remove(windowId);
              reject(new Error(browser.i18n.getMessage("InterceptionCancelled", nzb.title)));
            }
          }
        });
      }
    };
    browser.windows.onRemoved.addListener(onRemoveWindowListener);
    browser.runtime.onConnect.addListener(onConnectListener);
  });
  const category = await waitForPopup;
  return category;
};
