let defaultSettings = {
  "category": {
    "enabled": true,
    "type": "automatic",
    "types": {
      "automatic": {
        "categories": [{
            "name": "TV-Series",
            "pattern": "[e|s]\\d+"
          },
          {
            "name": "Movies",
            "pattern": "(x264|xvid|bluray|720p|1080p|untouched)"
          }
        ],
        "fallback": "manual"
      },
      "default": {
        "category": ""
      },
      "manual": {
        "categories": [
          "TV-Series",
          "Movies"
        ],
        "type": "target"
      }
    }
  },
  "targets": [{
      "type": "download",
      "active": true,
      "default": true,
      "name": "Download",
      "settings": {
        "categoryFolder": false,
        "defaultPath": "nzbfiles",
        "saveAs": false
      }
    },
    {
      "type": "nzbget",
      "active": false,
      "default": false,
      "name": "NZBGet",
      "settings": {
        "addPaused": false,
        "basepath": "",
        "host": "nzbget.myhome.locher.net",
        "password": "ml421364*",
        "port": "443",
        "scheme": "https",
        "username": "admin"
      }
    },
    {
      "type": "sabnzbd",
      "active": false,
      "default": false,
      "name": "Sabnzbd",
      "settings": {
        "addPaused": false,
        "apiKey": "",
        "basepath": "",
        "basicAuthPassword": "",
        "basicAuthUsername": "",
        "host": "localhost",
        "port": "8080",
        "scheme": "http"
      }
    },
    {
      "type": "synology",
      "active": false,
      "default": false,
      "name": "Synology Downloadstation",
      "settings": {
        "basepath": "",
        "basicAuthPassword": "",
        "basicAuthUsername": "",
        "host": "localhost",
        "password": "",
        "port": "5000",
        "scheme": "http",
        "username": ""
      }
    },
    {
      "type": "premiumize",
      "active": false,
      "default": false,
      "name": "Premiumize.me",
      "settings": {
        "password": "",
        "username": ""
      }
    }
  ],
  "general": {
    "catchLinks": true,
    "debug": true,
    "showNotifications": "info"
  },
  "interception": {
    "enabled": true,
    "default": [{
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
    "custom": [{
      "active": false,
      "domain": "",
      "handling": "sendFormDataAsPOST"
    }],
    "allowEdit": true
  },
  "processing": {
    "addCategory": true,
    "addPassword": true,
    "addTitle": true,
    "fileCheck": {
      "enabled": true,
      "threshold": 2
    },
    "processTitel": {
      "enabled": true,
      "type": "spaces"
    },
    "segmentCheck": {
      "enabled": true,
      "threshold": 0.02
    }
  },
  "searchengines": [{
      "active": true,
      "downloadURL": "https://newzleech.com/?m=gen&dl=1&post=%s",
      "name": "Newzleecher",
      "responseType": "html",
      "searchGroup": 1,
      "searchPattern": "name=\"binary\\[\\]\" value=\"(.*?)\"",
      "searchURL": "https://newzleech.com/?m=search&q=%s"
    },
    {
      "active": true,
      "downloadURL": "https://nzbindex.com/download/%s/",
      "name": "NZBIndex",
      "responseType": "json",
      "searchGroup": "",
      "searchPattern": "results.0.id",
      "searchURL": "https://nzbindex.com/search/json?sort=agedesc&hidespam=1&q=%s"
    },
    {
      "active": true,
      "downloadURL": "https://binsearch.info/?action=nzb&%s=1",
      "name": "BinSearch",
      "responseType": "html",
      "searchGroup": 1,
      "searchPattern": "name=\"(\\d{9,})\"",
      "searchURL": "https://binsearch.info/?max=100&adv_age=1100&q=%s"
    },
    {
      "active": true,
      "downloadURL": "https://binsearch.info/?action=nzb&%s=1&server=2",
      "name": "BinSearch (other groups)",
      "responseType": "html",
      "searchGroup": 1,
      "searchPattern": "name=\"(\\d{9,})\"",
      "searchURL": "https://binsearch.info/?max=100&adv_age=1100&server=2&q=%s"
    },
    {
      "active": true,
      "downloadURL": "http://nzbking.com/nzb:%s/",
      "name": "NZBKing",
      "responseType": "html",
      "searchGroup": 1,
      "searchPattern": "href=\"\\/details:(.*?)\\/\"",
      "searchURL": "http://nzbking.com/search/?q=%s"
    }
  ]
}