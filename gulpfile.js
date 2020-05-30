const fs = require('fs');
const package = JSON.parse(fs.readFileSync('./package.json'));

const { series, parallel, src, dest } = require('gulp');
const jeditor = require("gulp-json-editor");
const zip = require('gulp-zip');

function copySrc() {
    return src(["./src/*/**", "./*.md", "./LICENSE"])
    .pipe(dest("./build/chrome/"))
    .pipe(dest("./build/firefox/"));
}

function publish() {
    // body omitted
    return src("./src/manifest.json")
    .pipe(jeditor({
    "version": package.version
    },
    // the second argument is passed to js-beautify as its option
    {
    'indent_char': ' ',
    'indent_size': 2,
	'brace-style': 'end-expand'
    }))
    .pipe(dest("./build/chrome"))
    .pipe(jeditor({
    "applications": {
        "gecko": {
            "id": "{dd77cf0b-b93f-4e9f-8006-b642c02219db}",
            "strict_min_version": "60.0"
        }
    }
    },
    // the second argument is passed to js-beautify as its option
    {
    'indent_char': ' ',
    'indent_size': 2
    }))
    .pipe(dest("./build/firefox"));
}

function zipChrome() {
	return src('./build/chrome/*')
			.pipe(zip('NZBDonkey v' + package.version + '_Chrome.zip'))
			.pipe(dest('dist/v' + package.version));
}

function zipFF() {
	return src('./build/firefox/*')
			.pipe(zip('NZBDonkey v' + package.version + '_FF.zip'))
			.pipe(dest('dist/v' + package.version));
}

exports.build = series(parallel(copySrc, publish), parallel(zipChrome, zipFF));


