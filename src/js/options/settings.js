var nzbDonkeySettings = {};

nzbDonkeySettings.nzbTarget = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("settingsNZBTargetSubTitle")
    },
    {
        name: 'type',
        type: 'select',
        options: [
            {
                desc: chrome.i18n.getMessage("settingsNZBTargetDownload"),
                value: 'download'
            },
            {
                desc: chrome.i18n.getMessage("settingsNZBTargetSendTo", chrome.i18n.getMessage("nzbget")),
                value: 'nzbget'
            },
            {
                desc: chrome.i18n.getMessage("settingsNZBTargetSendTo", chrome.i18n.getMessage("sabnzbd")),
                value: 'sabnzbd'
            },
            {
                desc: chrome.i18n.getMessage("settingsNZBTargetSendTo", chrome.i18n.getMessage("synology")),
                value: 'synology'
            },
            {
                desc: chrome.i18n.getMessage("settingsNZBTargetSendTo", chrome.i18n.getMessage("premiumize")),
                value: 'premiumize'
            }
        ],
        default: 'download'
    }
];

nzbDonkeySettings.general = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("settingsGeneralNZBlnkTitle")
    },
    {
        name: 'catchLinks',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("settingsGeneralNZBlnk"),
        default: true
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("settingsGeneralNZBlnkDesc")
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("settingsGeneralNotificationsTitle")
    },
    {
        name: 'showNotifications',
        type: 'select',
        desc: chrome.i18n.getMessage("settingsGeneralNotifications"),
        options: [
                    {
                        desc: chrome.i18n.getMessage("settingsGeneralNotificationsAll"),
                        value: 'info'
                    },
                    {
                        desc: chrome.i18n.getMessage("settingsGeneralNotificationsSuccess"),
                        value: 'success'
                    },
                    {
                        desc: chrome.i18n.getMessage("settingsGeneralNotificationsError"),
                        value: false
                    }
                ],
        default: 'info'
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsGeneralDebugModeTitle")
    },
    {
        name: 'debug',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsGeneralDebugMode"),
        default: true
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsGeneralDebugModeDesc")
    }
];

nzbDonkeySettings.processing = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingTitle")
    },
    {
        name: 'processTitel',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingFilename"),
        options: [
            {
                name: 'type',
                type: 'select',
                options: [
                    {
                        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingFilenamePeriods"),
                        value: 'periods'
                    },
                    {
                        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingFilenameSpaces"),
                        value: 'spaces'
                    }
                ]
            }
        ],
        default: {enabled: false}
    },
    {
        name: 'addTitle',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingMetadataTitle"),
        default: true
    },
    {
        name: 'addPassword',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingMetadataPassword"),
        default: true
    },
    {
        name: 'addCategory',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsNZBFileprocessingMetadataCategory"),
        default: true
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsNZBFileCompletenessTitle")
    },
    {
        name: 'fileCheck',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsNZBFileCompletenessFileCount"),
        default: {enabled: true},
        options: [
            {
                type: 'h6',
                desc: chrome.i18n.getMessage("SettingsNZBFileCompletenessFileCountThreshold")
            },
            {
                type: 'select',
                name: 'threshold',
                options: [
                    {
                        desc: '0',
                        value: 0
                    },
                    {
                        desc: '1',
                        value: 1
                    },
                    {
                        desc: '2',
                        value: 2
                    },
                    {
                        desc: '3',
                        value: 3
                    },
                    {
                        desc: '4',
                        value: 4
                    },
                    {
                        desc: '5',
                        value: 5
                    }
                ],
                default: 2
            },
            {
                type: 'plaintext',
                text: chrome.i18n.getMessage("SettingsNZBFileCompletenessFileCountDesc")
            }
        ]
    },
    {
        name: 'segmentCheck',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsNZBFileCompletenessSegmentCount"),
        default: {enabled: true},
        options: [
            {
                type: 'h6',
                desc: chrome.i18n.getMessage("SettingsNZBFileCompletenessSegmentCountThreshold")
            },
            {
                type: 'select',
                name: 'threshold',
                options: [
                    {
                        desc: '0 %',
                        value: 0
                    },
                    {
                        desc: '1 %',
                        value: 0.01
                    },
                    {
                        desc: '2 %',
                        value: 0.02
                    },
                    {
                        desc: '3 %',
                        value: 0.03
                    },
                    {
                        desc: '4 %',
                        value: 0.04
                    },
                    {
                        desc: '5 %',
                        value: 0.05
                    }
                ],
                default: 0.02
            },
            {
                type: 'plaintext',
                text: chrome.i18n.getMessage("SettingsNZBFileCompletenessSegmentCountDesc")
            }
        ]
    }
];

nzbDonkeySettings.category = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsCategoriesTitle")
    },
    {
        name: 'enabled',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsCategories"),
        default: {enabled: true},
        options: [
            {
                name: 'type',
                type: 'select',
                desc: chrome.i18n.getMessage("SettingsCategoriesType"),
                options: [
                    {
                        desc: chrome.i18n.getMessage("SettingsCategoriesTypeDefault"),
                        value: 'default'
                    },
                    {
                        desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomatic"),
                        value: 'automatic'
                    },
                    {
                        desc: chrome.i18n.getMessage("SettingsCategoriesTypeManual"),
                        value: 'manual'
                    }
                ],
                default: 'automatic'
            }
        ]
    }
];

nzbDonkeySettings['category.default'] = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeDefaultTitle")
    },
    {
        name: 'category',
        type: 'text',
        default: ''
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsCategoriesTypeDefaultDesc")
    }
]

nzbDonkeySettings['category.automatic'] = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticTitle")
    },
    {
        name: 'categories',
        type: 'list',
        head: true,
        sortable: true,
        desc: '',
        fields: [
            {
                type: 'text',
                name: 'name',
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticName")
            },
            {
                type: 'text',
                name: 'pattern',
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticRegex")
            }
        ],
        default: [
            {
                name: 'TV-Series',
                pattern: '[e|s]\\d+'
            },
            {
                name: 'Movies',
                pattern: '(x264|xvid|bluray|720p|1080p|untouched)'
            }
        ]
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticDesc1")
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticDesc2")
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticDesc3")
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticFallbackTitle")
    },
    {
        name: 'fallback',
        type: 'select',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticFallbackDesc"), 
        options: [
            {
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeNoCategory"),
                value: false
            },
            {
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeDefault"),
                value: 'default'
            },
            {
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeManual"),
                value: 'manual'
            }
        ],
        default: false
    }
];

nzbDonkeySettings['category.manual'] = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeManualTitle")
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsCategoriesTypeManualDesc")
    },
    {
        name: 'type',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeManualType"),
        type: 'select',
        options: [
            {
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeManualTypeCustom"),
                value: 'manual',
            },
            {
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeManualTypeFromTarget"),
                value: 'target'
            }
        ],
        default: 'manual'
    },
    {
        type: 'html',
        html: '<span><b>*'+chrome.i18n.getMessage("caution")+':</b> '+chrome.i18n.getMessage("SettingsCategoriesTypeManualTypeFromTargetDesc")+'!</span>'
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsCategoriesTypeManualTypeCustomTitle"),
        class: 'customcategories hidden'
    },
    {
        name: 'categories',
        type: 'list',
        head: true,
        sortable: true,
        desc: '',
        fields: [
            {
                type: 'text',
                name: 'name',
                desc: chrome.i18n.getMessage("SettingsCategoriesTypeAutomaticName")
            }
        ],
        default: ['TV-Series','Movies'],
        class: 'customcategories hidden'
    }
];

nzbDonkeySettings.download = [
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsDownloadFolder")
    },
    {
        name: 'defaultPath',
        type: 'text',
        default: 'nzbfiles'
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsDownloadFolderDesc")
    },
    {
        type: 'html',
        html: '<p><strong>'+chrome.i18n.getMessage("caution")+':</strong> '+chrome.i18n.getMessage("SettingsDownloadFolderWarning")+'<p>'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsDownloadCategorySubFoldersTitle")
    },
    {
        name: 'categoryFolder',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsDownloadCategorySubFolders"),
        default: false
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsDownloadCategorySubFoldersDesc")
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsDownloadSaveAsTitle")
    },
    {
        name: 'saveAs',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsDownloadSaveAs"),
        default: false
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsDownloadSaveAsDesc1")
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsDownloadSaveAsDesc2")
    },
    {
        type: 'html',
        html: '<p><strong>'+chrome.i18n.getMessage("caution")+':</strong> '+chrome.i18n.getMessage("SettingsDownloadSaveAsWarning")+'<p>'
    }
];

nzbDonkeySettings.nzbget = [
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetHostName")+' <small>('+chrome.i18n.getMessage("SettingsTargetHostNameDesc")+')</small></h6>'
    },
    {
        name: 'host',
        type: 'text',
        default: 'localhost'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetPort")+' <small>('+chrome.i18n.getMessage("SettingsTargetNZBGetPortDesc")+')</small></h6>'
    },
    {
        name: 'port',
        type: 'text',
        default: '6789'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetConnectionScheme")
    },
    {
        name: 'scheme',
        type: 'select',
        options: [
            {
                desc: 'https://',
                value: 'https'
            },
            {
                desc: 'http://',
                value: 'http'
            }
        ],
        default: 'http'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetUsername")
    },
    {
        name: 'username',
        type: 'text',
        default: ''
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetPassword")
    },
    {
        name: 'password',
        type: 'password',
        default: ''
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetAddPausedTitle")
    },
    {
        name: 'addPaused',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsTargetAddPaused"),
        default: false
    },
    {
        type: 'html',
        html: '<hr / class="mt-4">',
        class: 'advanced hidden'
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsTargetAdvancedSettings"),
        class: 'advanced hidden'
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsTargetAdvancedSettingsDesc"),
        class: 'advanced hidden'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetReverseProxy")+' <small>('+chrome.i18n.getMessage("SettingsTargetNZBGetReverseProxyDesc")+')</small></h6>',
        class: 'advanced hidden'
    },
    {
        name: 'basepath',
        type: 'text',
        default: '',
        class: 'advanced hidden'
    }        
];

nzbDonkeySettings.sabnzbd = [
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetHostName")+' <small>('+chrome.i18n.getMessage("SettingsTargetHostNameDesc")+')</small></h6>'
    },
    {
        name: 'host',
        type: 'text',
        default: 'localhost'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetPort")+' <small>('+chrome.i18n.getMessage("SettingsTargetSABnzbdPortDesc")+')</small></h6>'
    },
    {
        name: 'port',
        type: 'text',
        default: '8080'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetConnectionScheme")
    },
    {
        name: 'scheme',
        type: 'select',
        options: [
            {
                desc: 'https://',
                value: 'https'
            },
            {
                desc: 'http://',
                value: 'http'
            }
        ],
        default: 'http'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetSABnzbdAPIKey")
    },
    {
        name: 'apiKey',
        type: 'text',
        default: ''
    },
    {
        type: 'html',
        html: '<span><b>*'+chrome.i18n.getMessage("caution")+':</b> '+chrome.i18n.getMessage("SettingsTargetSABnzbdAPIKeyDesc")+'!</span>'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetAddPausedTitle")
    },
    {
        name: 'addPaused',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsTargetAddPaused"),
        default: false
    },
    {
        type: 'html',
        html: '<hr / class="mt-4">',
        class: 'advanced hidden'
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsTargetAdvancedSettings"),
        class: 'advanced hidden'
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsTargetAdvancedSettingsDesc"),
        class: 'advanced hidden'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetReverseProxy")+' <small>('+chrome.i18n.getMessage("SettingsTargetSABnzbdReverseProxyDesc")+')</small></h6>',
        class: 'advanced hidden'
    },
    {
        name: 'basepath',
        type: 'text',
        default: '',
        class: 'advanced hidden'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetHTTPUsername"),
        class: 'advanced hidden'
    },
    {
        name: 'basicAuthUsername',
        type: 'text',
        default: '',
        class: 'advanced hidden'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetHTTPPassword"),
        class: 'advanced hidden'
    },
    {
        name: 'basicAuthPassword',
        type: 'password',
        default: '',
        class: 'advanced hidden'
    }
];

nzbDonkeySettings.synology = [
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetHostName")+' <small>('+chrome.i18n.getMessage("SettingsTargetHostNameDesc")+')</small></h6>'
    },
    {
        name: 'host',
        type: 'text',
        default: 'localhost'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetPort")+' <small>('+chrome.i18n.getMessage("SettingsTargetSynologyPortDesc")+')</small></h6>'
    },
    {
        name: 'port',
        type: 'text',
        default: '5000'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetConnectionScheme")
    },
    {
        name: 'scheme',
        type: 'select',
        options: [
            {
                desc: 'https://',
                value: 'https'
            },
            {
                desc: 'http://',
                value: 'http'
            }
        ],
        default: 'http'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetUsername")+' <small>('+chrome.i18n.getMessage("SettingsTargetSynologyUsernameDesc")+')</small></h6>'
    },
    {
        name: 'username',
        type: 'text',
        default: ''
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetPassword")
    },
    {
        name: 'password',
        type: 'password',
        default: ''
    },
    {
        type: 'html',
        html: '<hr />'
    },
    {
        type: 'html',
        html: '<hr / class="mt-4">',
        class: 'advanced hidden'
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsTargetAdvancedSettings"),
        class: 'advanced hidden'
    },
    {
        type: 'plaintext',
        text: chrome.i18n.getMessage("SettingsTargetAdvancedSettingsDesc"),
        class: 'advanced hidden'
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetReverseProxy")+' <small>('+chrome.i18n.getMessage("SettingsTargetSynologyReverseProxyDesc")+')</small></h6>',
        class: 'advanced hidden'
    },
    {
        name: 'basepath',
        type: 'text',
        default: '',
        class: 'advanced hidden'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetHTTPUsername"),
        class: 'advanced hidden'
    },
    {
        name: 'basicAuthUsername',
        type: 'text',
        default: '',
        class: 'advanced hidden'
    },
    {
        type: 'h6',
        desc: chrome.i18n.getMessage("SettingsTargetHTTPPassword"),
        class: 'advanced hidden'
    },
    {
        name: 'basicAuthPassword',
        type: 'password',
        default: '',
        class: 'advanced hidden'
    }
];

nzbDonkeySettings.premiumize = [
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetPremiumizeID")+' <small>('+chrome.i18n.getMessage("SettingsTargetPremiumizeIDDesc")+')</small></h6>'
    },
    {
        name: 'username',
        type: 'text',
        default: ''
    },
    {
        type: 'html',
        html: '<h6>'+chrome.i18n.getMessage("SettingsTargetPremiumizePIN")+' <small>('+chrome.i18n.getMessage("SettingsTargetPremiumizePINDesc")+')</small></h6>'
    },
    {
        name: 'password',
        type: 'password',
        default: ''
    },
];

nzbDonkeySettings.searchengines = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsSearchEnginesDefaultTitle")
    },
    {
        name: 'default',
        type: 'list',
        head: true,
        desc: chrome.i18n.getMessage("SettingsSearchEnginesDefaultDesc"),
        disabled: true,
        fields: [
            {
                type: 'checkbox',
                name: 'active',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesActive")
            },
            {
                type: 'text',
                name: 'name',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesName"),
                disabled: true
            },
            {
                type: 'text',
                name: 'searchURL',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesSearchURL"),
                disabled: true
            },
            {
                type: 'select',
                name: 'responseType',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesResponseType"),
                options: [
                    {
                        desc: '',
                        value: ''
                    },
                    {
                        desc: 'HTML',
                        value: 'html'
                    },
                    {
                        desc: 'JSON',
                        value: 'json'
                    }
                ],
                disabled: true
            },
            {
                type: 'text',
                name: 'searchPattern',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesJSONPath") +' / '+chrome.i18n.getMessage("SettingsSearchEnginesRegex"),
                disabled: true
            },
            {
                type: 'select',
                name: 'searchGroup',
                options: [
                    {
                        desc: '',
                        value: ''
                    },
                    {
                        desc: '1',
                        value: 1
                    },
                    {
                        desc: '2',
                        value: 2
                    },
                    {
                        desc: '3',
                        value: 3
                    },
                    {
                        desc: '4',
                        value: 4
                    },
                    {
                        desc: '5',
                        value: 5
                    }
                ],
                desc: chrome.i18n.getMessage("SettingsSearchEnginesRegexGroup"),
                disabled: true
            },
            {
                type: 'text',
                name: 'downloadURL',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesDownloadURL"),
                disabled: true
            }
        ],
        default: [
            {
                "active": true,
                "downloadURL": "https://newzleech.com/?m=gen&dl=1&post=%s",
                "responseType": "html",
                "name": "Newzleecher",
                "searchPattern": "name=\"binary\\[\\]\" value=\"(.*?)\"",
                "searchGroup": 1,
                "searchURL": "https://newzleech.com/?m=search&q=%s"
            },
            {
                "active": true,
                "downloadURL": "https://nzbindex.com/download/%s/",
                "responseType": "json",
                "name": "NZBIndex",
                "searchPattern": "results.0.id",
                "searchGroup": "",
                "searchURL": "https://nzbindex.com/search/json?sort=agedesc&hidespam=1&q=%s"
            },
            {
                "active": true,
                "downloadURL": "https://binsearch.info/?action=nzb&%s=1",
                "responseType": "html",
                "name": "BinSearch",
                "searchPattern": "name=\"(\\d{9,})\"",
                "searchGroup": 1,
                "searchURL": "https://binsearch.info/?max=100&adv_age=1100&q=%s"
            },
            {
                "active": true,
                "downloadURL": "https://binsearch.info/?action=nzb&%s=1&server=2",
                "responseType": "html",
                "name": "BinSearch (other groups)",
                "searchPattern": "name=\"(\\d{9,})\"",
                "searchGroup": 1,
                "searchURL": "https://binsearch.info/?max=100&adv_age=1100&server=2&q=%s"
            },
            {
                "active": true,
                "downloadURL": "http://nzbking.com/nzb:%s/",
                "responseType": "html",
                "name": "NZBKing",
                "searchPattern": "href=\"\\/details:(.*?)\\/\"",
                "searchGroup": 1,
                "searchURL": "http://nzbking.com/search/?q=%s"
            }
        ]
    },
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsSearchEnginesCustomTitle")
    },
    {
        name: 'custom',
        type: 'list',
        head: true,
        desc: chrome.i18n.getMessage("SettingsSearchEnginesCustomDesc"),
        fields: [
            {
                type: 'checkbox',
                name: 'active',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesActive")
            },
            {
                type: 'text',
                name: 'name',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesName")
            },
            {
                type: 'text',
                name: 'searchURL',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesSearchURL")
            },
            {
                type: 'select',
                name: 'responseType',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesResponseType"),
                options: [
                    {
                        desc: '',
                        value: ''
                    },
                    {
                        desc: 'HTML',
                        value: 'html'
                    },
                    {
                        desc: 'JSON',
                        value: 'json'
                    }
                ]
            },
            {
                type: 'text',
                name: 'searchPattern',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesJSONPath") +' / '+chrome.i18n.getMessage("SettingsSearchEnginesRegex")
            },
            {
                type: 'select',
                name: 'searchGroup',
                options: [
                    {
                        desc: '',
                        value: ''
                    },
                    {
                        desc: '1',
                        value: 1
                    },
                    {
                        desc: '2',
                        value: 2
                    },
                    {
                        desc: '3',
                        value: 3
                    },
                    {
                        desc: '4',
                        value: 4
                    },
                    {
                        desc: '5',
                        value: 5
                    }
                ],
                desc: chrome.i18n.getMessage("SettingsSearchEnginesRegexGroup")
            },
            {
                type: 'text',
                name: 'downloadURL',
                desc: chrome.i18n.getMessage("SettingsSearchEnginesDownloadURL")
            }
        ]
    },
    {
        type: 'html',
        html: `<p><strong>`+chrome.i18n.getMessage("SettingsSearchEnginesActive")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesActiveDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesName")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesNameDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesSearchURL")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesSearchURLDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesResponseType")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesResponseTypeDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesJSONPath")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesJSONPathDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesRegex")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesRegexDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesRegexGroup")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesRegexGroupDesc")+`<br />
               <strong>`+chrome.i18n.getMessage("SettingsSearchEnginesDownloadURL")+`:</strong> `+chrome.i18n.getMessage("SettingsSearchEnginesDownloadURLDesc")+`</p>`,
    }
];

nzbDonkeySettings.interception = [
    {
        type: 'h5',
        desc: chrome.i18n.getMessage("SettingsInterceptionTitle")
    },
    {
        name: 'enabled',
        type: 'checkbox',
        desc: chrome.i18n.getMessage("SettingsInterception"),
        default: {enabled: true},
        options: [
            {
                name: 'allowEdit',
                type: 'checkbox',
                desc: chrome.i18n.getMessage("SettingsInterceptionPrompt"),
                default: false
            },
            {
                type: 'html',
                html: '<p>'+chrome.i18n.getMessage("SettingsInterceptionPromptDesc")+'<br /><br /></p>',
            },
            {
                type: 'h5',
                desc: chrome.i18n.getMessage("SettingsInterceptionDefaultDomains")
            },
            {
                name: 'default',
                type: 'list',
                head: true,
                desc: chrome.i18n.getMessage("SettingsInterceptionDefaultDomainsDesc"),
                disabled: true,
                fields: [
                    {
                        type: 'checkbox',
                        name: 'active',
                        desc: chrome.i18n.getMessage("SettingsInterceptionActive")
                    },
                    {
                        type: 'text',
                        name: 'domain',
                        desc: chrome.i18n.getMessage("SettingsInterceptionDomain"),
                        disabled: true
                    },
                    {
                        type: 'select',
                        name: 'handling',
                        options: [
                            {
                                desc: '',
                                value: ''
                            },
                            {
                                desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingPOST"),
                                value: 'sendFormDataAsPOST'
                            },
                            {
                                desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingGET"),
                                value: 'sendFormDataAsGET'
                            },
                            {
                                desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingString"),
                                value: 'sendFormDataAsString'
                            }
                        ],
                        desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandling"),
                        disabled: true
                    }
                ],
                default: [
                    {
                        "active": true,
                        "domain": "newzleech.com",
                        "handling": "sendFormDataAsPOST"
                    },
                    {
                        "active": true,
                        "domain": "nzbindex.com",
                        "handling": "sendFormDataAsGET"
                    },
                    {
                        "active": true,
                        "domain": "nzbindex.nl",
                        "handling": "sendFormDataAsGET"
                    },
                    {
                        "active": true,
                        "domain": "binsearch.info",
                        "handling": "sendFormDataAsString"
                    },
                    {
                        "active": true,
                        "domain": "nzbking.com",
                        "handling": "sendFormDataAsPOST"
                    }
                ],
            },
            {
                type: 'h5',
                desc: chrome.i18n.getMessage("SettingsInterceptionCustomDomains")
            },
            {
                name: 'custom',
                type: 'list',
                head: true,
                desc: chrome.i18n.getMessage("SettingsInterceptionCustomDomainsDesc"),
                fields: [
                    {
                        type: 'checkbox',
                        name: 'active',
                        desc: chrome.i18n.getMessage("SettingsInterceptionActive")
                    },
                    {
                        type: 'text',
                        name: 'domain',
                        desc: chrome.i18n.getMessage("SettingsInterceptionDomain")
                    },
                    {
                        type: 'select',
                        name: 'handling',
                        options: [
                            {
                                desc: '',
                                value: ''
                            },
                            {
                                desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingPOST"),
                                value: 'sendFormDataAsPOST'
                            },
                            {
                                desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingGET"),
                                value: 'sendFormDataAsGET'
                            },
                            {
                                desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingString"),
                                value: 'sendFormDataAsString'
                            }
                        ],
                        desc: chrome.i18n.getMessage("SettingsInterceptionFormDataHandling")
                    }
                ]
            },
            {
                type: 'html',
                html: `<p><strong>`+chrome.i18n.getMessage("SettingsInterceptionActive")+`:</strong> `+chrome.i18n.getMessage("SettingsInterceptionActiveDesc")+`<br />
                       <strong>`+chrome.i18n.getMessage("SettingsInterceptionDomain")+`:</strong> `+chrome.i18n.getMessage("SettingsInterceptionDomainDesc")+`<br />
                       <strong>`+chrome.i18n.getMessage("SettingsInterceptionFormDataHandling")+`:</strong> `+chrome.i18n.getMessage("SettingsInterceptionFormDataHandlingDesc")+`</p>`,
            }
        ]
    }    
];