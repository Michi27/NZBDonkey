const debugLogger = debugLogName => {
        let debugLog = [];
        const log = (debugLogType, debugLogName,  debugLogText) => {
            if (typeof DEBUG === "undefined" || DEBUG) {
                debugLog.push({date: new Date(), type: debugLogType, text: debugLogText});
                return(console[debugLogType].bind(window.console, `[${debugLogName}] - ${debugLogType.toUpperCase()}: ${debugLogText}`));
            }
            else {
                return (_ => null);
            }
        }
        return {
            info: debugLogText => log("info", debugLogName, debugLogText),
            warn: debugLogText => log("warn", debugLogName, debugLogText),
            error: debugLogText => log("error", debugLogName, debugLogText),
            get: _ => debugLog
        }
};

const debugLog = debugLogger("NZBDonkey");

const logger = () => {
        let log = [];
        let i = 0;
        return {
            newEntry: _ => {
              i += 1;
              let j = i;
              log[j] = {};
              return {
                id: _ => j,
                set: (name, value, key = false) => {
                    if (key) {
                        log[j][key] = log[j][key] ? log[j][key] : {};
                        log[j][key][name] = value;
                    } else {
                        log[j][name] = value;
                    }
                },
                get: (name) => log[j][name],
              };
            },
            get: _ => log,
        }
};

const nzbLog = logger();
