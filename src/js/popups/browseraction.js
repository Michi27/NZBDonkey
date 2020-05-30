$(document).ready(function() {
    // calculate popup width and height
    var popupWidth = Math.round(screen.width/2.5);
    var popupHeight = Math.round(screen.height/2);
    $('body').css('width', popupWidth)
    $('body').css('height', popupHeight)
    
    var color = {};
    color['success'] = '#31B646';
    color['error'] = '#E91300';
    
    // i18n routine for the html
    $('[data-message]').each(function(){
        $(this).append(chrome.i18n.getMessage($(this).data('message')));
    });
    // Set the i18n title
    document.title = chrome.i18n.getMessage('extTitle');
    $("#openSettings").click(function() {
        chrome.runtime.openOptionsPage();
        window.close();
    });
    $("#closePopup").click(function() {
        window.close();
    });
    var debugLogShown = false;
    $('#showDebugLog').click(function() {
        if (debugLogShown) {
            $('#debugLog').addClass('hidden');
            $('#downloadHistroy').removeClass('hidden');
            $('#title').text(chrome.i18n.getMessage('popupDownloadHistory'));
            $('#showDebugLog').text(chrome.i18n.getMessage('extPopupShowDebugLog'));
            debugLogShown = false;
        }
        else {
            browser.runtime.sendMessage({
                action: "getDebugLog",
                }).then(function(response) {
                if (response.debugLog) {
                    if (response.debugLog.length > 1) {
                        var $NZBDonkey_debugLog = $("#NZBDonkey_debugLog").clone();
                        $("[id=NZBDonkey_debugLog]").remove();
                        for (i=response.debugLog.length - 1; i > -1; i-- ) {
                            var $logEntry = $NZBDonkey_debugLog.clone();
                            $logEntry.find("#logEntry").text(formatDate(response.debugLog[i].date) + " - " + response.debugLog[i].type.toUpperCase() + ": " + response.debugLog[i].text);
                            $logEntry.find("#logEntry").addClass("log-" + response.debugLog[i].type);
                            $logEntry.appendTo("#debugLogContent");
                        }
                        $('#downloadHistroy').addClass('hidden');
                        $('#debugLog').removeClass('hidden');
                        $('#title').text('Debug Log');
                        $('#showDebugLog').text(chrome.i18n.getMessage('extPopupShowDownloadHistory'));
                        debugLogShown = true;
                    }
                }
            });
        }
    });
    browser.runtime.sendMessage({
        action: "getLog",
    }).then(function(response) {
        if (response.logs) {
            if (response.logs.length > 1) {
                var $NZBDonkey_Logs = $("[id=NZBDonkey_Logs]").clone();
                $("[id=NZBDonkey_Logs]").remove();
                for (i=response.logs.length - 1; i > 0; i-- ) {
                    var $NZBDonkey_Log = $NZBDonkey_Logs.clone();
                    if (response.logs[i].success != "") {
                        $NZBDonkey_Log.find("[id=NZBDonkey_ID]").css('background-image', "url(/icons/NZBDonkey_" + response.logs[i].success + "_48.png)");
                        $NZBDonkey_Log.find("[id=NZBDonkey_ID]").css('text-shadow', '1px 1px 10px ' + color[response.logs[i].success]);                        
                    }
                    $NZBDonkey_Log.find("[id=NZBDonkey_ID]").text(i);
                    $NZBDonkey_Log.find("[id=NZBDonkey_Title]").text(response.logs[i].title);
                    $NZBDonkey_Log.find("[id=NZBDonkey_Status]").text(response.logs[i].status);
                    $NZBDonkey_Log.find("[id=NZBDonkey_Origin]").text(browser.i18n.getMessage('OriginNZBSearch', response.logs[i].origin));
                    $NZBDonkey_Log.find("[id=NZBDonkey_Category]").text(response.logs[i].category);
                    $NZBDonkey_Log.find("[id=log-button]").removeAttr('disabled');
                    $NZBDonkey_Log.find("[id=log-button]").attr('value', i);
                    if (i < response.logs.length - 1) {
                        $NZBDonkey_Log.addClass("pt-2 border-top");
                    }
                    $NZBDonkey_Log.appendTo("[id=Content]");
                }
                $('[id^=log-button]').click(function() {
                    alert('Title: ' + response.logs[$(this).val()].title + '\n' +
                          'Header: ' + response.logs[$(this).val()].header + '\n' +
                          'Password: ' + response.logs[$(this).val()].password);
                });
            }
        }
    });
    function formatDate(date) {
      date = new Date(date);
      let formatedDate = date.getFullYear().toString().padStart(4, '0') + "-";
      formatedDate += (date.getMonth() + 1).toString().padStart(2, '0') + "-";
      formatedDate += date.getDate().toString().padStart(2, '0') + " ";
      formatedDate += date.getHours().toString().padStart(2, '0') + ":";
      formatedDate += date.getMinutes().toString().padStart(2, '0') + ":";
      formatedDate += date.getSeconds().toString().padStart(2, '0') + ":";
      formatedDate += date.getMilliseconds().toString().padStart(4, '0');
      return formatedDate;
    }
});