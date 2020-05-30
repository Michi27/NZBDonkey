// ask the background script if we should catch left clicks on NZBLinks
(async () => {
  const catchLinks = await browser.runtime.sendMessage({
    action: "catchLinks",
  });
  // if yes
  if (catchLinks) {
    // add an event listener
    document.addEventListener("click", (e) => {
      const event = e || window.event;
      let target = event.target || event.srcElement;
      while (target) {
        if (target instanceof HTMLAnchorElement) {
          if (typeof target.getAttribute("href") === "string") {
            const link = target.getAttribute("href")
              .trim();
            if (/^nzblnk/i.test(link)) {
              event.preventDefault();
              browser.runtime.sendMessage({
                action: "linkUrl",
                linkUrl: link,
              });
            }
          }
          break;
        }
        target = target.parentNode;
      }
    }, true);
  }
})()
.catch((e) => {
  errorHandler(e);
});

// functions to handle the events
const events = {};

// function to handle the analyze selection event
events.analyzeSelection = (request) => {
  // define the variables
  let nzb = {
    selection: "",
    title: "",
    header: "",
    password: "",
  };

  // get html source from the selected text and replace input tags by their value
  // encapsulate the value with line breaks to make sure it is on a single line
  nzb.selection = getSelectionHtml()
    .replace(/<input.+?value\s*?=\s*?['"](.*?)['"].*?>/ig, "\n$1\n");

  // add some line breaks to some ending tags to avoid text rendered on different lines to be joined in one line
  nzb.selection = nzb.selection.replace(/(<\/div>|<\/p>|<\/td>|<\/li>)/ig, "$1\n");

  // remove all tags, blank lines and leading/trailing spaces
  nzb.selection = $(nzb.selection)
    .text()
    .replace(/^\s*([\s|\S]*?)\s*?$/mg, "$1");

  // test if the selection contains a description for the header starting with some common words used for and ending with a colon or a vertical bar
  if (/^.*((header|subje[ck]t|betreff|files?).*[:|]\s*)+(\S.*\S)$/im.test(nzb.selection)) {
    // set the header to the text after the description
    // we search for any text until we find it and then get all of it until the next line break
    // like this we will find the header information either if placed on the same line or if placed on the next line
    // we also take care of if the description is used twice (e.g. before the hidden tag and in the hidden tag again)
    nzb.header = nzb.selection.match(/^.*((header|subje[ck]t|betreff|files?).*[:|]\s*)+(\S.*\S)$/im)[3];
  }

  // test if the selection contains a NZB file name in the format of nzbfilename{{password}}
  // we first assume that the NZB file name is on its own line
  if (/^(.*){{(.*?)}}/m.test(nzb.selection)) {
    // set the title and password according to the NZB filename
    nzb.title = nzb.selection.match(/^(.*){{(.*?)}}/m)[1];
    nzb.password = nzb.selection.match(/^(.*){{(.*?)}}/m)[2];
    // check if maybe there is nevertheless a leading description and remove it from the title
    // assuming that the leading description includes the word NZB and ends with a colon
    if (/.*nzb.*:\s*/i.test(nzb.title)) {
      nzb.title = nzb.title.replace(/.*nzb.*:\s*/i, "");
    }
    // if no NZB file name was found the title and password have to be set by another way
  } else {
    // in this case simply set title to the first line of the selection
    nzb.title = nzb.selection.split("\n")[0];

    // test if the selection contains a description for the password starting with some common words used for and ending with a colon or a vertical bar
    if (/^.*((passwor[td]|pw|pass).*[:|]\s*)+(\S.*\S)$/im.test(nzb.selection)) {
      // set the password to the text after the description
      // we search for any text until we find it and then get all of it until the next line break
      // like this we will find the password either if placed on the same line or if placed on the next line
      // we also take care of if the description is used twice (e.g. before the hidden tag and in the hidden tag again)
      nzb.password = nzb.selection.match(/^.*((passwor[td]|pw|pass).*[:|]\s*)+(\S.*\S)$/im)[3];
    }
  }

  const html = `<p><label for="nzbdonkey-nzb-title">${browser.i18n.getMessage("extNZBTitle")}:</label><input type="text" id="nzbdonkey-nzb-title" name="nzbdonkey-nzb-title" value="${nzb.title}" class="modal-prompt-input"/></p>
<p><label for="nzbdonkey-nzb-header">${browser.i18n.getMessage("extNZBHeader")}: <small id="nzbdonkey-required">(${browser.i18n.getMessage("required")})</small></label><input type="text" id="nzbdonkey-nzb-header" name="nzbdonkey-nzb-header" value="${nzb.header}" class="modal-prompt-input"/></p>
<p><label for="nzbdonkey-nzb-password">${browser.i18n.getMessage("extNZBPassword")}:</label><input type="text" id="nzbdonkey-nzb-password" name="nzbdonkey-nzb-password" value="${nzb.password}" class="modal-prompt-input"/></p>
<p><label for="nzbdonkey-nzb-selection">${browser.i18n.getMessage("extNZBSelectedText")}:</label><textarea id="nzbdonkey-nzb-selection" rows="7" class="modal-prompt-input">${nzb.selection}</textarea></p>`;

  return new Promise((resolve, reject) => {
    modal({
      type: "primary", // Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
      title: `<img src="${browser.runtime.getURL("/icons/NZBDonkey_16.png")}" /><span>${browser.i18n.getMessage("extName")}</span>`, // Modal Title
      text: html, // Modal HTML Content
      size: "normal", // Modal Size (normal | large | small)
      buttons: [{
        text: browser.i18n.getMessage("extNZBGetNZBFile"), // Button Text
        val: true, // Button Value
        eKey: true, // Enter Keypress
        addClass: "btn-light-blue nzbdonkey-nzb-send", // Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
        onClick: (result) => {
          resolve({
            title: $("input[id=nzbdonkey-nzb-title]")
              .val(),
            header: $("input[id=nzbdonkey-nzb-header]")
              .val(),
            password: $("input[id=nzbdonkey-nzb-password]")
              .val(),
          });
          return true;
        },
      }, {
        text: browser.i18n.getMessage("cancel"), // Button Text
        val: false, // Button Value
        eKey: false, // Enter Keypress
        addClass: "btn-light-blue-outline", // Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
        onClick: (result) => {
          resolve({
            cancel: true,
          });
          return true;
        },
      }, ],
      onShow: (result) => {
        if ($("input[id=nzbdonkey-nzb-header]")
          .val() === "") {
          $("input[id=nzbdonkey-nzb-header]")
            .addClass("required");
          $("small[id=nzbdonkey-required]")
            .addClass("show");
          $("a[class*=nzbdonkey-nzb-send]")
            .addClass("btn-disabled");
        }
        $("input[id=nzbdonkey-nzb-header]")
          .on("change keydown paste input", () => {
            if ($(this)
              .val() === "") {
              $(this)
                .addClass("required");
              $("small[id=nzbdonkey-required]")
                .addClass("show");
              $("a[class*=nzbdonkey-nzb-send]")
                .addClass("btn-disabled");
            } else {
              $(this)
                .removeClass("required");
              $("small[id=nzbdonkey-required]")
                .removeClass("show");
              $("a[class*=nzbdonkey-nzb-send]")
                .removeClass("btn-disabled");
            }
          });
      },
      // After show Modal function
      callback: (result) => {
        if (result === false) {
          resolve({
            cancel: true,
          });
          return true;
        }
      },
      // Callback Function after close Modal (ex: function(result){alert(result); return true;})
      closeClick: false, // Close Modal on click near the box
    });
  });
};

// add listener for messages from the background script
browser.runtime.onMessage.addListener(async (request) => {
  try {
    if (events[request.action]) {
      return await events[request.action](request);
    } else {
      throw new Error(`received an unknown request with action: ${request.action}`);
    }
  } catch (e) {
    errorHandler(e);
    return Promise.resolve(e);
  }
});

// helper functions

// function to get the html from the selection
function getSelectionHtml() {
  let html = "";
  if (typeof window.getSelection !== "undefined") {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      let container = document.createElement("div");
      for (let i = 0; i < sel.rangeCount; i += 1) {
        container.appendChild(sel.getRangeAt(i)
          .cloneContents());
      }
      html = container.innerHTML;
    }
  }
  return `<div>${html}</div>`; // encapsulate with a div container otherwise jQuery.text() will remove plain text, e.g. if selection was done in a text field only
}

// function for error handling
function errorHandler(e) {
  browser.runtime.sendMessage({
    action: "errorHandler",
    error: `Content Script Error: ${e.message}`,
  });
}
