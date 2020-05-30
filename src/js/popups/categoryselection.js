$(document).ready(function() {
    // i18n routine for the html
    $('[data-message]').each(function(){
        $(this).append(chrome.i18n.getMessage($(this).data('message')));
    });
    chrome.windows.getCurrent(function(window) {
        var windowId = window.id;
        // open a port to the background script and tell it we are ready...
        var portName = "CategorySelection_" + windowId;
        var port = chrome.runtime.connect({name: portName});
        port.postMessage({
            ready: true,
            windowId: windowId
        });
        // now wait for the background script to send the categories
        port.onMessage.addListener(function(request) {
            if (request.categories && Array.isArray(request.categories) && request.windowId === windowId) {
                var html = '<button class="btn btn-outline-primary btn-block p-2 my-2 font-weight-bold font-italic" value="">' + chrome.i18n.getMessage('categorySelectionNoCategory') + '</button>\n';
                request.categories.forEach(function(element) {
                    html += '<button class="btn btn-outline-primary btn-block p-2 my-2 font-weight-bold" value="' + element + '">' + element + '</button>\n';
                });
                $('#categorySelectionNZBTitle').text(request.title);
                $('#categorySelectionCategoryButtons').html(html);
                $('button').click(function() {
                    clearInterval(timer);
                    if ($(this).attr('value') == 'false') {
                        var category = false;
                    }
                    else {
                        var category = $(this).attr('value');
                    }
                    port.postMessage({
                        category: category,
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
        });
    });
});