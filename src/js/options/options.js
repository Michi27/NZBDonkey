// Fall back to storage.local if storage.sync is not available
if (chrome.storage.sync) {
    var storage = chrome.storage.sync;
} else {
    var storage = chrome.storage.local;
}

var testButtonTabs = [
    "#nzbget",
    "#sabnzbd",
    "#synology",
    "#premiumize"
];

var advancedSettingsTabs = [
    "#nzbget",
    "#sabnzbd",
    "#synology",
];

var NZBCategoryTarget = [
    "#nzbget",
    "#sabnzbd",
];

$(document).ready(function() {

    // Set default settings
    nzbDonkeyOptions.opts.autoSave = true;
    nzbDonkeyOptions.opts.saveDefaults = true;

    // Add version number to the about page
    $("#NZBDonkeyVersion").append('v.' + chrome.runtime.getManifest().version + ' (beta)');
    
    // Add current year to the copyright
    $("#NZBDonkeyCopyrightYear").append((new Date()).getFullYear());

    // Add the change log
    $.ajax({
        url: chrome.extension.getURL('CHANGELOG.md'),
        dataType: 'text',
        beforeSend: function( xhr ) {
            xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
        }
    }).done(function(response) {
        var converter = new Markdown.Converter();
        var html = converter.makeHtml(response);
        $('#changelog-content').append(html);
    }).fail(function() {
        $('#changelog-content').append(chrome.i18n.getMessage('extChangeLogLoadingErrorMessage'));
    });

    // i18n routine for the html
    $('[data-message]').each(function(){
        $(this).append(chrome.i18n.getMessage($(this).data('message')));
    });
    // Set the i18n title
    document.title = chrome.i18n.getMessage('extSettingsTitle');

    // Load the setting tabs
    loadSettingTabs(nzbDonkeySettings).then(function() {
        // Set the event handlers
        setAdvancedSettingsSwitchHandler();
        setTestButtonHandler();
        setResetButtonHandler();
        setCategoryButtonHandler();
        setNavLinkHandler();
        setNZBTargetChangeHandler();
        // Set the correct NZBTarget link
        setNZBTarget($("#nzbtarget-content select").val());
        setCategoryChangeHandler();
        setCategory();
        setCategoryTypeChangeHandler();
        setAutomaticCategoryTypeChangeHandler();
        setCategoryType($("#category-content select").val());
        setManualCategoryTypeChangeHandler()
        setManualCategoryType($("#category-manual-content select").val())
        // Show the general tab
        switchTabs("#nzbtarget");
        // Hide the loading overlay
        $('#loading-overlay').addClass('hidden');
        $(window).resize(function () {
            adjustMargin();
        });
    }).catch(function(e) {
        $('#loading-overlay').replaceWith(chrome.i18n.getMessage('extSettingsLoadingErrorMessage') + ': ' + e);
    });

});

function adjustMargin(activetab = "") {
    if (activetab == "") {
        activetab = $("a[class*=active]").attr("href");
    }
    var tid = $(activetab + "-row-subcontent").get(0);
    var scrollbar = tid.offsetWidth - tid.scrollWidth;
    if (scrollbar > 0) {
        $("#title-row").css("padding-right", scrollbar + 15 + "px");
        $(activetab + "-row-headercontent").css("padding-right", scrollbar + 15 + "px");
        $(activetab + "-row-subcontent").css("padding-right", scrollbar + "px");
        $("#footer-row").css("padding-right", scrollbar + 15 + "px");
    }
    else {
        $("#title-row").css("padding-right", "");
        $(activetab + "-row-headercontent").css("padding-right", "");
        $(activetab + "-row-subcontent").css("padding-right", "");
        $("#footer-row").css("padding-right", "");       
    }
}

function setNZBTargetChangeHandler() {
    $("#nzbtarget-content select").on("change", function() {
        setNZBTarget(this.value);
    });
}

function setNZBTarget(type) {
    // Hide all subtabs
    $("[id^=nzbtarget-subcontent-]").each(function(index) {
        $(this).addClass('hidden');
    });
    // Hide the test button
    $("#test-button").addClass('hidden');
    // Hide the advanced settings switch
    $("#advanced-settings-switch").addClass('hidden');
    // Show the selected subtab
    $("#nzbtarget-subcontent-" + type).removeClass('hidden');
    // Show the test button if required
    if ($.inArray("#" + type, testButtonTabs) > -1) {
        $("#test-button").removeClass('hidden');
    }
    // Show the advanced settings switch if required
    if ($.inArray("#" + type, advancedSettingsTabs) > -1) {
        $("#advanced-settings-switch").removeClass('hidden');
    }
    adjustMargin("#nzbtarget");
    if (!($.inArray("#" + type, NZBCategoryTarget) > -1) && $("#category-manual-content select").val() == "target") {
        modal({
            type: 'warning', //Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
            title: chrome.i18n.getMessage('caution'), //Modal Title
            text: chrome.i18n.getMessage('SettingsCategoriesTypeManualTypeFromTargetWarning1'), //Modal HTML Content
            size: 'normal', //Modal Size (normal | large | small)
            buttons: [{
                text: 'OK', //Button Text
                val: false, //Button Value
                eKey: true, //Enter Keypress
                addClass: 'btn-light-blue', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
            }],
        });
        $("#category-manual-content select").val("manual");
        var evt = new Event("change");
        var dom = $("#category-manual-content select").get(0);
        dom.dispatchEvent(evt);
    }
}

function setCategory() {
    if ($("#category-content input[type=checkbox]").prop('checked')) {
        $("#category-row-subcontent").removeClass('hidden');
    }
    else {
        $("#category-row-subcontent").addClass('hidden');
    }
    adjustMargin("#category");
}

function setCategoryChangeHandler() {
    $("#category-content input[type=checkbox]").on("change", function() {
        setCategory();
    });
}

function setCategoryType(type) {
    // Hide all subtabs
    $("[id^=category-subcontent-]").each(function(index) {
        $(this).addClass('hidden');
    });
    // Show the selected subtab
    $("#category-subcontent-" + type).removeClass('hidden');
    if (type == "automatic") {
        setAutomaticCategoryType($("#category-subcontent-automatic select").val());
    }
    adjustMargin("#category");
}

function setCategoryTypeChangeHandler() {
    $("#category-content select").on("change", function() {
        setCategoryType(this.value);
    });
}

function setManualCategoryType(type) {
    if (type == "manual") {
        $(".customcategories").each(function(index) {
            $(this).removeClass('hidden');
        });
        $("#category-manualtarget-content").each(function(index) {
            $(this).addClass('hidden');
        });    
    }
    else {
        if (($.inArray("#" + $("#nzbtarget-content select").val(), NZBCategoryTarget) > -1)) {
            $(".customcategories").each(function(index) {
                $(this).addClass('hidden');
            });   
            $("#category-manualtarget-content").each(function(index) {
                $(this).removeClass('hidden');
            });
        }
        else {
            modal({
                type: 'warning', //Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
                title: chrome.i18n.getMessage('caution'), //Modal Title
                text: chrome.i18n.getMessage('SettingsCategoriesTypeManualTypeFromTargetWarning2'), //Modal HTML Content
                size: 'normal', //Modal Size (normal | large | small)
                buttons: [{
                    text: 'OK', //Button Text
                    val: false, //Button Value
                    eKey: true, //Enter Keypress
                    addClass: 'btn-light-blue', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
                }],
                callback: function(r) {
                    $("#category-manual-content select").val("manual");
                    var evt = new Event("change");
                    var dom = $("#category-manual-content select").get(0);
                    dom.dispatchEvent(evt);
                }
            });
        }
    }
    adjustMargin("#category");
}

function setManualCategoryTypeChangeHandler() {
    $("#category-manual-content select").on("change", function() {
        setManualCategoryType(this.value);
    });
}

function setAutomaticCategoryType(type) {
    if (type == "default") {
        $("#category-subcontent-default").removeClass('hidden');
    }
    else {
        $("#category-subcontent-default").addClass('hidden');
    }
    if (type == "manual") {
        $("#category-subcontent-manual").removeClass('hidden');
    }
    else {
        $("#category-subcontent-manual").addClass('hidden');
    }
    adjustMargin("#category");
}

function setAutomaticCategoryTypeChangeHandler() {
    $("#category-subcontent-automatic select").on("change", function() {
        setAutomaticCategoryType(this.value);
    });
}

function setNavLinkHandler() {
    $("a.nav-link").click(function() {
        switchTabs($(this).attr("href"));
    });
}

function setAdvancedSettingsSwitchHandler() {
    $("#showAdvancedSettings").change(function() {
        if ($("#showAdvancedSettings").prop('checked')) {
            modal({
                type: 'warning', //Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
                title: chrome.i18n.getMessage('caution'), //Modal Title
                text: chrome.i18n.getMessage('SettingsTargetAdvancedSettingsDesc'), //Modal HTML Content
                size: 'normal', //Modal Size (normal | large | small)
                buttons: [{
                    text: chrome.i18n.getMessage('SettingsTargetAdvancedSettingsShow'), //Button Text
                    val: true, //Button Value
                    eKey: false, //Enter Keypress
                    addClass: 'btn-light-blue-outline', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
                    onClick: function(result) {
                        $(".advanced").each(function(index) {
                            $(this).removeClass('hidden');
                        });
                        adjustMargin();
                        return true;
                    }
                }, {
                    text: chrome.i18n.getMessage('cancel'), //Button Text
                    val: false, //Button Value
                    eKey: true, //Enter Keypress
                    addClass: 'btn-light-blue', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
                    onClick: function(result) {
                        $("#showAdvancedSettings").prop('checked', false);
                        return true;
                    }
                }],
                callback: function(r) {
                    if (r === false) {
                        $("#showAdvancedSettings").prop('checked', false);
                    }
                }
            });
        } else {
            $(".advanced").each(function(index) {
                $(this).addClass('hidden');
            });  
            adjustMargin();            
        }
    });
}

function setTestButtonHandler() {
    $("#test-button").click(function() {
        let button = $(this);
        button.prop("disabled", true);
        button.html(chrome.i18n.getMessage('extSettingsTestButtonTesting'))
        chrome.runtime.sendMessage({
            action: "testConnection",
        }, function(response) {
            if (response.success) {
                var modalType = 'success';
                var modalTitle = chrome.i18n.getMessage('success');
            } else {
                var modalType = 'error';
                var modalTitle = chrome.i18n.getMessage('error');
            }
            modal({
                type: modalType, //Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
                title: modalTitle, //Modal Title
                text: response.response.replace(/\n/gi, "<br />"), //Modal HTML Content
                size: 'normal', //Modal Size (normal | large | small)
                buttons: [{
                    text: chrome.i18n.getMessage('close'), //Button Text
                    val: true, //Button Value
                    eKey: true, //Enter Keypress
                    addClass: 'btn-light-blue-outline', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
                    onClick: function(result) {
                        return true;
                    }
                }],
            });
            button.html(chrome.i18n.getMessage('extSettingsTestButton'));
            button.prop("disabled", false);
        });
    });
}

function setResetButtonHandler() {
    $("#reset-button").click(function() {
        modal({
            type: 'warning', //Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
            title: chrome.i18n.getMessage('caution'), //Modal Title
            text: chrome.i18n.getMessage('extSettingsResetWarningMessage'), //Modal HTML Content
            size: 'normal', //Modal Size (normal | large | small)
            buttons: [{
                text: chrome.i18n.getMessage('extSettingsResetButton'), //Button Text
                val: true, //Button Value
                eKey: false, //Enter Keypress
                addClass: 'btn-light-red-outline', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
                onClick: function(result) {
                    storage.clear();
                    location.reload(true);
                    return true;
                }
            }, {
                text: chrome.i18n.getMessage('cancel'), //Button Text
                val: false, //Button Value
                eKey: true, //Enter Keypress
                addClass: 'btn-light-blue', //Button Classes (btn-large | btn-small | btn-green | btn-light-green | btn-purple | btn-orange | btn-pink | btn-turquoise | btn-blue | btn-light-blue | btn-light-red | btn-red | btn-yellow | btn-white | btn-black | btn-rounded | btn-circle | btn-square | btn-disabled)
                onClick: function(result) {
                    return true;
                }
            }],
        });
    });
}

function setCategoryButtonHandler() {
    $("#category-button").click(function() {
        let button = $(this);
        button.prop("disabled", true);
        chrome.runtime.sendMessage({
            action: "getTargetCategories",
        }, function(response) {
            if (response.categories && Array.isArray(response.categories)) {
                var $div = $('<div></div>')
                for (var i = 0; i < response.categories.length; i++) {
                    var category = '<input type="text" class="form-control" data-title="Search Engine Name" disabled="true" value="' + response.categories[i] + '">';
                    $(category).appendTo($div);
                }
            }
            else {
                var $div = $('<div class="alert alert-danger pb-3" role="alert"><p></p></div>');
                if (response.error) {
                    $div.text(response.error);
                }
                else {
                    $div.text(chrome.i18n.getMessage('error')+': '+chrome.i18n.getMessage('unknownError')+'!');
                }
            }
            $('#category-button-result').empty();
            $div.appendTo('#category-button-result');
            button.prop("disabled", false);
            adjustMargin();
        });
    });
}

function switchTabs(tab) {
    // Get all elements with class="tabcontent" and hide them
    $(".tabcontent").each(function(index) {
        $(this).addClass('hidden');
    });
    // Get all elements with class="nav-link" and remove the class "active"
    $(".nav-link").each(function(index) {
        $(this).removeClass("active");
    });
    // Hide the test button container
    $("#test-button-container").addClass('hidden');
    // Hide the advanced settings switch container
    $("#advanced-settings-switch-container").addClass('hidden');
    // Show the selected tab and its title
    $(tab).removeClass('hidden');
    $(tab + '-title').removeClass('hidden');
    // Add the "active" class to the link for that tab
    $("a[href='" + tab + "']").addClass("active");
    // Show the test button container if required
    if (tab == "#nzbtarget") {
        $("#test-button-container").removeClass('hidden');
    }
    // Show the advanced settings switch container if required
    if (tab == "#nzbtarget") {
        $("#advanced-settings-switch-container").removeClass('hidden');
    }
    adjustMargin(tab);
}

function loadSettingTabs(settings) {

    return new Promise(function(resolve, reject) {
        var settingTabs = [];
        for (var key in settings) {
            if (!Array.isArray(settings[key])) {
                for (var key2 in settings[key]) {
                    settingTabs.push(nzbDonkeyOptions.addTab(key + '.' + key2, settings[key][key2]));
                }
            }
            else {
                settingTabs.push(nzbDonkeyOptions.addTab(key, settings[key]));
            }
        }
        Promise.all(settingTabs).then(function() {
            resolve();
        }).catch(function(e) {
            reject(e);
        });
    });

}

(function() {
    // Expose this library.
    nzbDonkeyOptions = {};
    nzbDonkeyOptions.base = {};
    nzbDonkeyOptions.opts = {
        // True if you want settings to be saved as they are changed.
        autoSave: true,

        // True if you want default values to be saved when user visits
        // the options page. Useful if you want to only specify default values
        // in one place, without having to check if an option is set.
        // Note that it requires the options page to be visited once.
        saveDefaults: true,
    };

    var changedValues = {};
    var $saveButton = document.querySelector('#save-button');
    var flashSavedAlert = function() {
        var timer;
        $('#save-alert').removeClass('hidden');
        clearTimeout(timer);
        timer = setTimeout(function() {
            $('#save-alert').addClass('hidden');
        }, 1000);
    };
    $saveButton.addEventListener('click', function() {
        storage.set(changedValues);
        $saveButton.setAttribute('disabled', true);
        flashSavedAlert();
    });

    var initialSave = false;
    // Add the extension's title to the top of the page.
    var setupRan = false;

    function setup() {
        if (setupRan) {
            return;
        }

        if (nzbDonkeyOptions.opts.autoSave) {
            $('#save-button').addClass('hidden');
        }
        else {
            $('#save-button').removeClass('hidden');
        }

        setupRan = true;
    }

    /**
     * @param {String} name
     * @param {String!} desc Will be placed at the top of the page of the tab
     * @param {Array.<Object>} options
     */
    nzbDonkeyOptions.addTab = function(name, desc, options) {

        return new Promise(function(resolve, reject) {
            setup();
            if (!options) {
                options = desc;
                desc = null;
            }
            var keyName = name.toLowerCase().replace(' ', '_');
            var $tabview = h('div', {
//                id: keyName + '-content'
            });
            if (desc) {
                $tabview.append(h('p.tab-desc', desc));
            }

            var keys = [];
            (function getOptionKeys(options) {
                options.forEach(function(option) {
                    if (option.name) {
                        keys.push(getKeyPath(keyName, option));
                    } else if (option.type === 'column' || option.type === 'row') {
                        getOptionKeys(option.options);
                    }
                });
            })(options);

            storage.get(keys, function(items) {
                initialSave = true;
                addTabOptions($tabview, keyName, items, options);
                var destination = '#' + keyName.replace('.', '-') + '-content';
                $(destination).empty();
                $(destination).append($tabview);
                initialSave = false;
                resolve();
            });

        });

    };


    /**
     * @param {String} desc
     * @param {Array.<Object>} options
     */
    nzbDonkeyOptions.set = function(desc, options) {
        nzbDonkeyOptions.addTab('', desc, options);
    };

    function getKeyPath(parentKey, option) {
        return (parentKey || '') +
            (parentKey && option.name ? '.' : '') + (option.name || '');
    }

    let addTabOptions = function($parent, keyName, values, options) {
        options.forEach(function(option) {
            var key = getKeyPath(keyName, option);
            var value = values[key];
            var latestValue = value;

            // Clone value so that it can be compared to new value.
            var cloneValue = function() {
                value = util.deepClone(latestValue);
            };
            $saveButton.addEventListener('click', cloneValue);

            // Use requestAnimationFrame whenever possible,
            // so that it doensn't seep into load time.
            requestAnimationFrame(cloneValue);

            var save = function(newValue) {
                if (typeof value === 'undefined' && nzbDonkeyOptions.opts.saveDefaults) {
                    storage.set({
                        [key]: newValue
                    });
//                    if (!initialSave) {
                        flashSavedAlert();
//                    }
                } else {
                    latestValue = newValue;
                    requestAnimationFrame(function() {
                        var isEqual = util.deepEqual(value, newValue);
                        if (nzbDonkeyOptions.opts.autoSave) {
                            if (!isEqual) {
                                storage.set({
                                    [key]: newValue
                                });
                                flashSavedAlert();
                                cloneValue();
                            }
                        } else if (isEqual) {
                            delete changedValues[key];
                            if (!Object.keys(changedValues).length) {
                                $saveButton.setAttribute('disabled', true);
                            } else {
                                flashSavedAlert();
                            }
                        } else {
                            changedValues[key] = newValue;
                            $saveButton.removeAttribute('disabled');
                        }
                    });
                }
            };
            var $container = addOption(key, values, value, save, option, top);
            if ($container) {
                if (option.class) {
                    $container = $($container).addClass(option.class).get(0);
                }
                $parent.append($container);
            }
        });
    }

    function addHeader(header = 4, option, key) {
        return h('h' + header + '.' + key, option.desc);
    }

    function addText(option, key) {
        return h('p.' + key, option.text);
    }

    function addHTML(option, key) {
        var $html =  $().add(option.html).addClass(key.replace(/\./gi," "));
        return $html.get(0);
    }
    
    function addOption(key, values, value, save, option, top) {
        if (value === undefined && option.default != null) {
            value = option.default;
            if (nzbDonkeyOptions.opts.saveDefaults) {
                save(value);
            }
        }

        var $option, r;
        switch (option.type) {
            case 'checkbox':
                $option = nzbDonkeyOptions.base.checkbox(value, save, option, key);
                break;
            case 'object':
                $option = nzbDonkeyOptions.base.object(value, save, option, key);
                break;
            case 'list':
                $option = nzbDonkeyOptions.base.list(value, save, option, key);
                break;
            case 'column':
                $option = nzbDonkeyOptions.base.column(values, save, option, key, top);
                break;
            case 'row':
                $option = nzbDonkeyOptions.base.row(values, save, option, key, top);
                break;
            case 'plaintext':
                $option = addText(option, key);
                break;
            case 'html':
                $option = addHTML(option, key);
                break;            default:
                if (/h\d/.test(option.type)) {
                    $option = addHeader(option.type.match(/h(\d)/)[1], option, key);
                } else if (!option.type) {
                    $option = nzbDonkeyOptions.base.checkbox(value, save, option, key);
                } else if (nzbDonkeyOptions.fields[option.type]) {
                    $option = nzbDonkeyOptions.addLabelNField(value, save, option, key);
                } else if ((r = /(\w+)-list/.exec(option.type))) {
                    $option = nzbDonkeyOptions.base
                        .singleFieldList(value, save, option, r[1]);
                } else if ((r = /checkbox-(\w+)/.exec(option.type))) {
                    $option = nzbDonkeyOptions.base
                        .checkboxNField(value, save, option, r[1]);
                } else {
                    throw Error('Could not find option type: ' + option.type);
                }
        }

        if (option.preview) {
            var $label = $option.querySelector('label');
            $label.append(h('span.preview-container', h('span.preview')),
                h('img.preview-image', {
                    src: 'previews/' + key + '.' + option.preview
                }));
        }

        return $option;
    }

    nzbDonkeyOptions.base.checkbox = function(value, save, option, key) {
        var $label = h('label');
        var $container = h('.checkbox.' + key, $label);
        var $subContainer, $triangle;
        var options = option.options;
        var hasOptions = !!options;

        var checked = value;
        if (hasOptions) {
            if (value == null || typeof value !== 'object') {
                value = {};
            }
            checked = value.enabled;
        }

        var $checkbox = nzbDonkeyOptions.fields.checkbox(checked, function(checked) {
            if (hasOptions) {
                value.enabled = checked;
            } else {
                value = checked;
            }
            save(value);
        }, option);

        if (hasOptions) {
            $subContainer = addOptions(value, save, option, key + '.subcontainer');
            $container.append($subContainer);
            if (!checked) {
                $subContainer.style.display = 'none';
            }

            var toggleContainer = function(checked) {
                if (checked) {
                    $($subContainer).slideDown(500);
                    setTimeout(function(){ adjustMargin(); }, 600);
                } else {
                    $($subContainer).slideUp(500);
                    setTimeout(function(){ adjustMargin(); }, 600);
                }
            };

            $checkbox.addEventListener('change', function() {
                checked = !checked; //$checkbox.checked; ????
                toggleContainer(checked);
            });
        }

        $label.append($checkbox);
        $label.append(h('span', option.desc));
        return $container;
    };

    nzbDonkeyOptions.base.checkboxNField = function(value, save, option, type) {
        if (value == null || typeof value !== 'object') {
            value = {};
        }
        var mustSave = false;
        if (value.enabled === undefined && option.defaultEnabled !== undefined) {
            value.enabled = option.defaultEnabled;
            mustSave = true;
        }
        if (value.value === undefined && option.defaultValue !== undefined) {
            value.value = option.defaultValue;
            mustSave = true;
        }
        if (mustSave && nzbDonkeyOptions.opts.saveDefaults) {
            save(value);
        }

        if (!nzbDonkeyOptions.fields[type]) {
            throw Error('Could not find option type: ' + type);
        }
        var $container = h('.suboption.' + type);
        var $box = $container.appendChild(h('span'));

        $box
            .append(nzbDonkeyOptions.fields.checkbox(value.enabled, function(checked) {
                value.enabled = checked;
                save(value);
            }, option));

        $container.append(nzbDonkeyOptions.addField(value.value, function(newValue) {
            value.value = newValue;
            save(value);
        }, option, type));

        if (option.desc) {
            $container.append(h('label', option.desc));
        }
        return $container;
    };

    nzbDonkeyOptions.base.object = function(value, save, option, key) {
        var $container = h('.object.' + key);
        if (option.desc) {
            $container.append(h('label', option.desc));
        }
        $container.append(addOptions(value, save, option, key));
        return $container;
    };

    function addOptions(value, save, option, key) {
        if (value == null || typeof value !== 'object') {
            value = {};
        }
        var $container = h('.suboptions.' + key);
        option.options.forEach(function(option) {
            var optionKey = getKeyPath(key, option);
            var $option = addOption(optionKey, value, value[option.name],
                function(newValue) {
                    if (option.name) {
                        value[option.name] = newValue;
                    }
                    save(value);
                }, option);
            if ($option) {
                $container.append($option);
            }
        });
        return $container;
    }

    nzbDonkeyOptions.addLabelNField = function(value, save, option, key) {
        var $container = h('.suboption.' + key);
        var $field = nzbDonkeyOptions.addField(value, save, option);
        if (option.desc) {
            $container.append(h('label', option.desc));
        }
        $container.append(h('.field-container', $field));
        $container.classList.add(option.singleline ? 'singleline' : 'multiline');
        return $container;
    };

    nzbDonkeyOptions.base.list = function(list, save, options, key) {
        var $container = h('.suboption.list.' + key);
        var $wrapper, shown = true;

        if (options.desc) {
            var $label = $container.appendChild(h('label', options.desc));
            if (options.collapsible) {
                shown = false;
                var $triangle = h('span.triangle', {
                    onclick: function() {
                        shown = !shown;
                        if (shown) {
                            $triangle.textContent = '▼';
                            slideYShow($wrapper);
                        } else {
                            $triangle.textContent = '▶';
                            slideYHide($wrapper);
                        }
                    },
                }, '▶');
                $label.prepend($triangle);
            }
        }

        list = list || [];
        var $table = $container.appendChild(h('table'));
        if (options.desc && options.collapsible) {
            $wrapper = $container.appendChild(h('', {
                style: 'display: none'
            }, $table));
        }
        var $tbody = $table.appendChild(h('tbody'));
        var rows;
        var heads = {};

        if (options.head) {
            var $thead = h('tr');
            var prevfield;
            options.fields.forEach(function(field) {
                if (!field.bindTo || !prevfield.bindTo) {
                    var $container = heads[field.name] = h('div', field.desc);
                    $thead.append(h('th', $container));
                } else {
                    heads[field.name] = heads[prevfield.name];
                }
                prevfield = field;
            });
            $table.prepend(h('thead', $thead));
        }

        // Check if each column should be shown.
        function checkColumns(init) {
            options.fields.forEach(function(field) {
                if (!field.bindTo) {
                    return;
                }
                var show = rows.some(function(row) {
                    return row.shown[field.name];
                });
                var $head = heads[field.name];
                var isVisible = !!$head.offsetParent;
                if (show && !isVisible) {
                    setTimeout(slideXShow.bind(null, $head), init ? 0 : 500);
                } else if (!show && isVisible) {
                    if (init) {
                        $head.style.display = 'none';
                    } else {
                        slideXHide($head);
                    }
                }
            });
        }

        function saveFields() {
            var newValues = rows.map(function(getValue) {
                return getValue();
            });
            save(newValues.filter(function(rowValue) {
                if (rowValue == null || rowValue === '') {
                    return false;
                } else if (options.filter && !options.filter(rowValue)) {
                    return false;
                } else if (typeof rowValue === 'object') {
                    for (var i = 0, len = options.fields.length; i < len; i++) {
                        var field = options.fields[i];
                        if (field.required && !rowValue[field.name]) {
                            return false;
                        }
                    }
                    return Object.keys(rowValue).some(function(key) {
                        return rowValue[key] != null;
                    });
                }
                return true;
            }));
            requestAnimationFrame(function() {
                rows.forEach(function(row) {
                    row.update(newValues);
                });
                if (options.head) {
                    checkColumns(false);
                }
            });
        }

        var fieldsMap = {};
        options.fields.forEach(function(field) {
            fieldsMap[field.name] = field;
        });

        function addNewRow(animate) {
            var row;

            function remove() {
                rows.splice(rows.indexOf(row), 1);
                saveFields();
            }
            row = addListRow($tbody, null, options.fields, fieldsMap, saveFields,
                remove, false, options.sortable, animate, key, options.disabled);
            rows.push(row);
            requestAnimationFrame(function() {
                var rowValues = rows.map(function(getValue) {
                    return getValue();
                });
                rows.forEach(function(row) {
                    row.update(rowValues);
                });
            });
        }

        rows = list.map(function(rowData, i) {
            var row;

            function remove() {
                rows.splice(rows.indexOf(row), 1);
                saveFields();
            }
            var fields = i === 0 && options.first ? options.first : options.fields;
            row = addListRow($tbody, rowData, fields, fieldsMap, saveFields,
                remove, i === 0 && options.first,
                options.sortable, false, key, options.disabled);
            return row;
        });

        if (options.first && !rows.length) {
            var row = addListRow($tbody, null, options.first, fieldsMap, saveFields,
                function() {}, true, options.sortable, false, key, options.disabled);
            rows.push(row);
            saveFields();
        }

        // Always start with one new row.
        if (!options.disabled) {
            addNewRow();
        }

        // Check if columns with the `bindTo` should be displayed.
        if (options.head) {
            requestAnimationFrame(checkColumns.bind(null, true));
        }

        // When user edits the last row, add another.
        function onChange(e) {
            if ($tbody.lastChild.contains(e.target) && !options.disabled) {
                addNewRow(true);
            }
        }

        $tbody.addEventListener('input', onChange);
        $tbody.addEventListener('change', onChange);

        if (options.sortable) {
            dragula([$tbody], {
                moves: (el, source, handle) => {
                    return (!options.first || el != el.parentNode.children[0]) &&
                        handle.classList.contains('sort') &&
                        handle.closest('tbody') == $tbody;
                },
                accepts: (el, target, source, sibling) => {
                    return !sibling.classList.contains('gu-mirror');
                },
                direction: 'vertical',
                mirrorContainer: $tbody,

            }).on('cloned', ($mirror, $original) => {
                // Set the mirror's td's to a fixed width since taking a row
                // out of a table removes its alignments from the
                // table's columns.
                var $mirrorTDs = $mirror.querySelectorAll(':scope > td');
                $original.querySelectorAll(':scope > td').forEach(function($td, i) {
                    $mirrorTDs[i].style.width = $td.offsetWidth + 'px';
                });

                // Copy the value of the mirror's form elements.
                // Since `node.cloneNode()` does not do so for some of them.
                var selection = 'select, input[type=radio]';
                var $mirrorFields = $mirror.querySelectorAll(selection);
                $original.querySelectorAll(selection).forEach(function($field, i) {
                    var $node = $mirrorFields[i];
                    $node.value = $field.value;
                    if ($node.checked) {
                        // Change the name of the radio field so that checking the
                        // original element again won't uncheck the mirrored element.
                        $node.setAttribute('name', $node.getAttribute('name') + '_');
                        $field.checked = true;
                    }
                });

            }).on('dragend', () => {
                rows.forEach(function(a) {
                    var $child = a.$tr;
                    a.index = 0;
                    while (($child = $child.previousSibling) != null) {
                        a.index++;
                    }
                });
                rows.sort(function(a, b) {
                    return a.index - b.index;
                });
                saveFields();
            });
        }

        return $container;
    };

    function addListRow($table, values, fields, fieldsMap, save, remove, unremovable, sort, animate, key, isdisabled) {
        var $tr = h('tr');
        if (unremovable) {
            $tr.classList.add('unremovable');
        }
        if (animate) {
            $tr.style.display = 'none';
            setTimeout(showTR.bind(null, $tr), 100);
        }

        var getValue = function() {
            return values;
        };
        getValue.$tr = $tr;

        // Keep track which fields in this row are being shown.
        getValue.shown = {};

        var $prevtd, prevfield;
        var fieldUpdates = fields.map(function(field) {
            function saveField(newValue) {
                var name = field.name;
                if (fields.length === 1) {
                    values = newValue;
                } else if (name) {
                    values[name] = newValue;
                }
                fieldUpdates.forEach(function(up) {
                    up.checkBind(name, newValue);
                });
                save();
            }

            var $field;
            var update = {};
            update.checkBind = function(name, newValue) {
                var bindTo = field.bindTo;
                if (bindTo && bindTo.field === name) {
                    var isVisible = !!$field.offsetParent;
                    var equals = bindToEquals(bindTo.value, newValue);
                    if (equals && !isVisible) {
                        slideXShow($field);
                        getValue.shown[field.name] = true;
                    } else if (!equals && isVisible) {
                        slideXHide($field);
                        getValue.shown[field.name] = false;
                    }
                }
            };

            update.hide = function() {
                if (field.bindTo) {
                    slideXHide($field);
                }
            };

            update.checkSelect = function(newValues) {
                if (field.type === 'select') {
                    field.options
                        .filter(function(f) {
                            return f.unique;
                        })
                        .forEach(function(option) {
                            var display = newValues.some(function(rowValue) {
                                return rowValue !== values &&
                                    rowValue[field.name] === option.value;
                            }) ? 'none' : '';
                            $field
                                .querySelector('option[value="' + option.value + '"]')
                                .style.display = display;
                        });
                }
            };

            var bindTo = field.bindTo;
            var $td = bindTo && prevfield && prevfield.bindTo ?
                $prevtd : h('td');
            if (bindTo) {
                $td.classList.add('bind-to');
            }
            $prevtd = $td;
            prevfield = field;
            var $fieldContainer = $tr.appendChild($td);
            var fieldValue;
            if (!values && (fields.length > 1 ||
                    field.type === 'column' || field.type === 'row')) {
                values = {};
            }

            if (fields.length === 1) {
                fieldValue = values = values !== undefined ? values : field.default;
            } else {
                fieldValue = values[field.name] =
                    values[field.name] !== undefined ? values[field.name] : field.default;
            }

            if (nzbDonkeyOptions.fields[field.type]) {
                $field = nzbDonkeyOptions.addField(fieldValue, saveField, field);
            } else if (field.type === 'column') {
                $field = nzbDonkeyOptions.base.column(values, save, field, key);
            } else if (field.type === 'row') {
                $field = nzbDonkeyOptions.base.row(values, save, field, key);
            } else {
                throw Error('Could not find option type: ' + field.type);
            }
            $fieldContainer.append($field);

            requestAnimationFrame(function() {
                if (!bindTo) {
                    return;
                }
                if (
                    (values[bindTo.field] &&
                        !bindToEquals(bindTo.value, values[bindTo.field])) ||
                    (!values[bindTo.field] &&
                        !bindToEquals(bindTo.value,
                            fieldsMap[bindTo.field].options[0].value))
                ) {
                    $field.style.display = 'none';
                    getValue.shown[field.name] = false;
                } else {
                    if (animate) {
                        setTimeout(() => {
                            slideXShow($field);
                        }, 500);
                    } else {
                        $field.style.display = '';
                        $field.style.maxWidth = '100%;';
                    }
                    getValue.shown[field.name] = true;
                }
            });

            return update;
        });
        if (!isdisabled) {
            $tr.append(h('td', h('a.delete', {
                onclick: function() {
                    fieldUpdates.forEach(function(update) {
                        update.hide();
                    });
                    setTimeout(function() {
                        hideTR($tr, function() {
                            $tr.remove();
                        });
                    }, 250);
                    remove();
                },
            }, 'delete')));
        }

        if (!unremovable && sort) {
            $tr.append(h('td', h('a.sort', 'sort')));
        }
        $table.append($tr);

        getValue.update = function(newValues) {
            fieldUpdates.forEach(function(update) {
                update.checkSelect(newValues);
            });
        };

        return getValue;
    }

    function bindToEquals(bindToValue, fieldValue) {
        return Array.isArray(bindToValue) ?
            bindToValue.indexOf(fieldValue) > -1 : bindToValue === fieldValue;
    }

    nzbDonkeyOptions.base.singleFieldList = function(value, save, options, type) {
        options.fields = [{
            type: type,
            name: options.name
        }];
        return nzbDonkeyOptions.base.list(value, save, options);
    };

    nzbDonkeyOptions.base.column = function(values, save, option, key, top) {
        delete option.name;
        var $container;
        if (top) {
            $container = h('div.column.' + key);
            addTabOptions($container, key, values, option.options);
        } else {
            $container = addOptions(values, save, option, key);
            $container.classList.add('column');
        }
        return $container;
    };

    nzbDonkeyOptions.base.row = function(values, save, option, key, top) {
        var $container = nzbDonkeyOptions.base.column(values, save, option, key, top);
        $container.classList.add('row');
        return $container;
    };

    nzbDonkeyOptions.addField = function(value, save, option, type) {
        var fn = nzbDonkeyOptions.fields[type || option.type];
        if (!fn) {
            return;
        }
        var lastTimeStamp;
        var $field = fn(value, function(newValue, e) {
            if (e) {
                if (e.timeStamp < lastTimeStamp) {
                    return;
                }
                lastTimeStamp = e.timeStamp;
            }
            if (option.validate && !option.validate(newValue)) {
                $field.classList.add('invalid');
            } else {
                $field.classList.remove('invalid');
                save(newValue, e);
            }
        }, option);
        if (option.desc) {
            $field.setAttribute('data-title', option.desc);
        }
        if (option.disabled) {
            $field.setAttribute('disabled', true);
        }
        return $field;
    };
})();


// Define all available fields.
nzbDonkeyOptions.fields = {};

nzbDonkeyOptions.fields.checkbox = function(value, save) {
    var $checkbox = h('input[type=checkbox]');

    if (value != null) {
        $checkbox.checked = value;
    }

    $checkbox.addEventListener('change', function() {
        save($checkbox.checked);
    });

    var $toggle = h('label', {
        class: "switch"
    });
    $toggle.append($checkbox);
    $toggle.append(h('span', {
        class: "slider round"
    }));
    return $toggle;
};

nzbDonkeyOptions.fields.text = function(value, save) {
    var $textbox = h('input[type="text"]', {
        class: "form-control"
    });
    if (value !== undefined) {
        $textbox.value = value;
    }
    var debouncedInput = util.debounce(500, function(e) {
        if (e.target.validity.valid) {
            save($textbox.value, e);
        }
    });
    $textbox.addEventListener('input', debouncedInput);
    $textbox.addEventListener('change', debouncedInput);
    return $textbox;
};

nzbDonkeyOptions.fields.password = function(value, save) {
    var $passwordbox = h('input[type="password"]', {
        "class": "form-control"
    });
    if (value !== undefined) {
        $passwordbox.value = value;
    }
    var debouncedInput = util.debounce(500, function(e) {
        if (e.target.validity.valid) {
            save($passwordbox.value, e);
        }
    });
    $passwordbox.addEventListener('input', debouncedInput);
    $passwordbox.addEventListener('change', debouncedInput);
    return $passwordbox;
};

nzbDonkeyOptions.fields.url = function(value, save, option) {
    var $field = nzbDonkeyOptions.fields.text(value, save, option);
    $field.setAttribute('type', 'url');
    return $field;
};

nzbDonkeyOptions.fields.select = function(value, save, option) {
    var valueMap = {};
    var $select = h('select', {
        class: "form-control"
    });
    var firstValue = null;
    option.options.forEach(function(option) {
        var value = typeof option === 'object' ? option.value : option;
        var desc = typeof option === 'object' ? option.desc : option;
        valueMap[value] = value;
        $select.append(h('option', {
            "value": value.toString()
        }, desc));
        if (firstValue === null) {
            firstValue = value;
        }
    });
    $select.value = value || firstValue;
//    $($select).on('change', function(e) {
    $select.addEventListener('change', function(e) {   
        var val = $select.value;
        save(valueMap[val] !== undefined ? valueMap[val] : val, e);
    });
    return $select;
};

nzbDonkeyOptions.fields.radio = function(value, save, option) {
    var $container = h('.radio-options', {
        class: "form-control"
    });
    var name = option.name + "_" + (~~(Math.random() * 1e9)).toString(36);
    option.options.forEach(function(option) {
        var val = typeof option === 'object' ? option.value : option;
        var desc = typeof option === 'object' ? option.desc : option;
        var id = val + "_" + (~~(Math.random() * 1e9)).toString(36);
        var $row = $container.appendChild(h('.radio-option'));
        var $radio = (h('input[type=radio]', {
            id,
            name,
            value: val,
            checked: value == val,
            onchange: function(e) {
                if ($radio.checked) {
                    save(val, e);
                }
            },
        }));
         var $toggle = h('label', {
            class: "switch"
        });
        $toggle.append($radio);
        $toggle.append(h('span', {
            class: "slider round"
        }));
        $row.appendChild($toggle);
        if (desc) {
            $row.append(h('label', {
                for: id
            }, desc));
        }
        if (value == val) {
            $("#menu_" + value).css("display", "block");
        }
    });

    return $container;
};

nzbDonkeyOptions.fields.file = function(value, save) {
    return h('input[type=file]', {
        value,
        onchange: function(e) {
            save(e.target.files, e);
        },
        class: "form-control"
    });
};