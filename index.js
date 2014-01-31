var through = require('through');
var os = require('os');
var path = require('path');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function(fileName, opt){

    if (!fileName) throw new PluginError('gulp-concat-plus', 'Missing fileName option for gulp-concat');
    if (!opt) opt = {};
    if (!opt.newLine) opt.newLine = gutil.linefeed;
    if (!opt.before) opt.before = "";
    if (!opt.after) opt.after = "";
    if (!opt.trim) opt.trim = false;

    var buffer = [];
    var firstFile = null;

    function bufferContents(file){

        if (file.isNull()) return; // ignore
        if (file.isStream()) return this.emit('error', new PluginError('gulp-concat-plus', 'Streaming not supported'));

        if (!firstFile) firstFile = file;

        var content = null;
        if (opt.trim) {
            content = file.contents.toString('utf8').trim();
        } else {
            content = file.contents.toString('utf8');
        }

        buffer.push(content);
    }

    function endStream(){
        if (buffer.length === 0) return this.emit('end');

        var joinedContents = opt.before + buffer.join(opt.newLine) + opt.after;

        var joinedPath = path.join(firstFile.base, fileName);

        var joinedFile = new File({
            cwd: firstFile.cwd,
            base: firstFile.base,
            path: joinedPath,
            contents: new Buffer(joinedContents)
        });

        this.emit('data', joinedFile);
        this.emit('end');
    }

    return through(bufferContents, endStream);
};
