// function to check the nzb file
const checknzbfile = {};

// function to check the nzb file validity
checknzbfile.validity = (nzbFile) => {
  // check if nzb file is string
  if (typeof nzbFile === "string") {
    // convert the nzb file from XML into JSON for simpler handling
    // xmlToJSON from https://github.com/metatribal/xmlToJSON
    nzbFile = xmlToJSON.parseString(nzbFile);
  }
  // check if it is actually a nzb file
  if (isset(() => nzbFile.nzb) && typeof nzbFile.nzb === "object") {
    // if yes return the nzb file as JSON object
    return nzbFile;
  } else {
    return false;
  }
};

// function to check the nzb file completeness
checknzbfile.completeness = (nzbFile) => {
  // prepare the files and segment counters
  let filesTotal = 0;
  let filesExpected = 0;
  let filesMissing = 0;
  let segmentsTotal = 0;
  let segmentsExpected = 0;
  let segmentsExpectedPerFile = 0;
  let segmentsMissing = 0;
  let segmentsMissingPercent = 0;
  // prepare the result object
  let result = {
    complete: true,
    error: false,
  };
  // check if nzb file is string
  if (typeof nzbFile === "string") {
    // convert the nzb file from XML into JSON for simpler handling
    // xmlToJSON from https://github.com/metatribal/xmlToJSON
    nzbFile = xmlToJSON.parseString(nzbFile);
  }
  // if yes, check if it does contain files
  if (isset(() => nzbFile.nzb[0].file) && typeof nzbFile.nzb[0].file === "object") {
    // Threshold value for missing files or segments for rejection
    const fileThreshold = settings.processing.fileCheck.threshold;
    const segmentThreshold = settings.processing.segmentCheck.threshold;
    // RegExp for the expected amounts of files, expected amount of files is in capturing group 2
    const reFilesExpected = new RegExp(".*?[(\\[](\\d{1,4})\\/(\\d{1,4})[)\\]].*?\\((\\d{1,4})\\/(\\d{1,5})\\)", "i");
    // RegExp for the expected segments per file, expected amount of segments is in capturing group 2
    const reSegmentsExpected = new RegExp(".*\\((\\d{1,4})\\/(\\d{1,5})\\)", "i");
    // get the amount of files
    filesTotal = nzbFile.nzb[0].file.length;
    // loop through the files
    for (let file of nzbFile.nzb[0].file) {
      // check if the file subject contains the expected amount of files
      // if not, the filesExpected counter will remain 0
      if (isset(() => file._attr.subject._value) && file._attr.subject._value !== "") {
        if (reFilesExpected.test(file._attr.subject._value)) {
          // check if the found expected amount of files is bigger than an already found one
          // like this the highest number will be used e.g. in cases when an uploader subsequently has added more files
          if (Number(file._attr.subject._value.match(reFilesExpected)[2]) > filesExpected) {
            // if yes, set filesExpected to the found value
            filesExpected = Number(file._attr.subject._value.match(reFilesExpected)[2]);
          }
        }
        // reset segmentsExpectedPerFile
        segmentsExpectedPerFile = 0;
        // check if the file subject contains the expected amount of segments for this file
        if (reSegmentsExpected.test(file._attr.subject._value)) {
          // if yes, set the value
          segmentsExpectedPerFile = Number(file._attr.subject._value.match(reSegmentsExpected)[2]);
        } else {
          // if not, we loop through the segments and get the highest number from the number attribute
          // this is not very accurate but still in some cases might give an indication for missing segments
          if (file.segments[0].segment === "object") {
            for (let segment of file.segments[0].segment) {
              if (isset(() => segment._attr.number._value) && segment._attr.number._value !== "") {
                if (Number(segment._attr.number._value) > segmentsExpectedPerFile) {
                  segmentsExpectedPerFile = Number(segment._attr.number._value);
                }
              }
            }
          }
        }
      }
      // add the segments of this file to the total amount of segments
      if (isset(() => file.segments[0].segment) && typeof file.segments[0].segment === "object") {
        segmentsTotal += file.segments[0].segment.length;
      }
      // add the expected segments for this file to the total amount of expected segments
      segmentsExpected += segmentsExpectedPerFile;
    }
    // calculate missing files and segments
    filesMissing = filesExpected - filesTotal > 0 ? filesExpected - filesTotal : 0;
    segmentsMissing = segmentsExpected - segmentsTotal > 0 ? segmentsExpected - segmentsTotal : 0;
    segmentsMissingPercent = segmentsExpected - segmentsTotal > 0 ? Math.round((segmentsMissing / segmentsExpected * 100) * 100) / 100 : 0;
    // if file check is enabled and missing files are above threshold, the nzb file is incomplete
    if (settings.processing.fileCheck.enabled && (filesMissing > fileThreshold)) {
      result.error = `${browser.i18n.getMessage("NZBFileIncomplete")} ${filesMissing} ${browser.i18n.getMessage("NZBFileMissingFiles")}`;
    }
    // if segment check is enabled and missing segments are above threshold, the nzb file is incomplete
    if (settings.processing.segmentCheck.enabled && (segmentsMissing / segmentsTotal > segmentThreshold)) {
      if (result.error) {
        result.error = `${result.error} ${browser.i18n.getMessage("and")}`;
      } else {
        result.error = `${browser.i18n.getMessage("NZBFileIncomplete")}`;
      }
      result.error = `${result.error} ${segmentsMissing} ${browser.i18n.getMessage("NZBFileMissingSegments")} (${segmentsMissingPercent}%)`;
    }
  }
  // if the nzb file does not contain any files it is obviously incomplete
  else {
    result.error = browser.i18n.getMessage("NZBFileNoFiles");
  }
  if (result.error) {
    result.complete = false;
  }
  result.filesTotal = filesTotal;
  result.filesExpected = filesExpected;
  result.filesMissing = filesMissing;
  result.segmentsTotal = segmentsTotal;
  result.segmentsExpected = segmentsExpected;
  result.segmentsMissing = segmentsMissing;
  result.segmentsMissingPercent = segmentsMissingPercent;
  return result;
};
