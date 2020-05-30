const fs = require('fs');
const package = JSON.parse(fs.readFileSync('./package.json'));

const { series, parallel, src, dest } = require('gulp');
const jeditor = require("gulp-json-editor");
const concat = require('gulp-concat');
const del = require('delete');

function clean(cb) {
  // body omitted
  cb();
}

function cssTranspile(cb) {
  // body omitted
  cb();
}

function cssMinify(cb) {
  // body omitted
  cb();
}

function jsTranspile(cb) {
  // body omitted
  cb();
}

function copyIcons() {
    return src("./src/icons/*.*")
    .pipe(dest("./build/chrome/icons"))
    .pipe(dest("./build/firefox/icons"));
}

function jsMinify(cb) {
  // body omitted
  cb();
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
    'indent_size': 2
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

exports.build = parallel(copyIcons, publish);


