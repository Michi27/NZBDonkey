$(document).ready(function() {
    // i18n routine for the html
    $('[data-message]').each(function(){
        $(this).append(chrome.i18n.getMessage($(this).data('message')));
    });
    chrome.windows.getCurrent(function(window) {
        const windowId = window.id;
        // open a port to the background script and tell it we are ready...
        var portName = "editPopup_" + windowId;
        var port = chrome.runtime.connect({name: portName});
        port.postMessage({
            ready: true,
            windowId: windowId
        });
        // now wait for the background script to send the information
        port.onMessage.addListener(function(request) {
            if (request.windowId === windowId) {
                $('#editPopupNZBTitle').val(request.title);
                $('#editPopupNZBPassword').val(request.password);
                $('button').click(function() {
                    clearInterval(timer);
                    if ($(this).attr('value') == 'false') {
                        var submit = false;
                    }
                    else {
                        var submit = true;
                    }
                    port.postMessage({
                        submit: submit,
                        title: $('#editPopupNZBTitle').val(),
                        password: $('#editPopupNZBPassword').val(),
                        category: $('#editPopupNZBCategory').val(),
                        windowId: windowId
                    });
                });
                var timer = setInterval(function(){
                    chrome.windows.getLastFocused(function(focusedWindow) {
                        if (focusedWindow.id != windowId) {
                            chrome.windows.update(windowId, {focused: true, drawAttention: true});
                        }
                    });
                }, 5000);
            }
            if (typeof request.category !== "undefined") {
              $('#editPopupNZBCategory').val(request.category);
              $( function() {
                  var availableTags = request.categories;
                  $( "#editPopupNZBCategory" ).autocomplete({
                      //      source: availableTags, // uncomment this and comment the following to have normal autocomplete behavior
                      source: function (request, response) {
                          response( availableTags);
                      },
                      minLength: 0
                  }).focus(function(){
                              $(this).data("uiAutocomplete").search($(this).val()); // uncomment this and comment the following to have autocomplete behavior when opening
                      //$(this).data("uiAutocomplete").search('');
                  });
              });
            }
            else {
              $('#category').addClass('hidden');
              $('#password').removeClass('flex_min');
              $('#password').addClass('flex_max');
            }
        });
    });
});