/*
**  grunt-newer-explicit -- Grunt Task for running tasks if source files are newer only
**  Copyright (c) 2013-2014 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/  

/* global module:  false */
module.exports = function (grunt) {

    /* global require: false */
    var path  = require("path");
    var fs    = require("fs");
    var chalk = require("chalk");
    var glob  = require("glob");

    /*  define the Grunt task  */
    grunt.registerMultiTask("newer", "Run tasks if source files are newer only", function () {
        /*  prepare options  */
        var options = this.options({
            tasks: []
        });
        grunt.verbose.writeflags(options, "Options");

        /*  utility function for determining information about a file  */
        var statFile = function (filename) {
            var stat;
            try { stat = fs.statSync(filename); }
            catch (err) { stat = null; }
            return stat;
        };

        /*  utility function for determining modification time from file information  */
        var mtimeOf = function (stat) {
            var mtime;
            try { mtime = stat.mtime.getTime(); }
            catch (err) { mtime = 0; }
            return mtime;
        };


        /*  iterate over all src-dest file pairs...  */
        var newer = false;
        this.files.forEach(function (f) {
            /*  short-circuit processing  */
            if (newer) {
                return;
            }

            /* get newest file from all destinations */
            var newestDestFile_mtime = 0;
            var newestDestFile = "";
            var destFileList = [];
            if(typeof f.dest === 'string') {
                destFileList = glob.sync(f.dest); 
                if(destFileList.length < 1) {
                    grunt.log.warn("No destination files matching \"" + chalk.red(f.dest) + "\" found.");
                    newer = true;
                    return; 
                }
            }  else {
                f.dest.forEach(function(destFileGlob) {
                    var fileList = glob.sync(destFileGlob); 
                    if(fileList.length < 1) {
                        grunt.log.warn("No destination files matching \"" + chalk.red(destFileGlob) + "\" found.");
                        newer = true;
                        return; 
                    }
                    destFileList = destFileList.concat(fileList); 
                }); 
            }

            if(!newer) {
                /* loop over file list **/
                destFileList.forEach(function(destFile) { 
                    /*  check for destination file  */
                    if (destFile.match(/\/$/))
                        destFile = path.join(destFile, path.basename(src));
                    var dst_stat = statFile(destFile);

                    /** if file exists update to newest stamp **/
                    if (dst_stat !== null) {
                        var destFile_mtime = mtimeOf(dst_stat);
                        if(destFile_mtime > newestDestFile_mtime) {
                            newestDestFile_mtime = destFile_mtime;
                            newestDestFile = destFile;
                        }
                    }
                });
            }

            /*  iterate over all source files... */
            f.src.forEach(function (src) {
                /*  short-circuit processing  */
                if (newer) {
                    return;
                }

                /*  check for source file  */
                var src_stat = statFile(src);
                if (src_stat === null) {
                    grunt.log.warn("Source file \"" + chalk.red(src) + "\" not found.");
                    return;
                }

                else if (mtimeOf(src_stat) > newestDestFile_mtime) {
                    grunt.log.writeln("Destination file \"" + chalk.red(newestDestFile) + "\" out-of-date.");
                    newer = true;
                }
            });
        });

        /*  in case one of the source files is newer, run the specified
            tasks to allow the destination files to be (re)created */
        if (newer) {
            grunt.log.writeln("Running tasks: \"" +
                options.tasks
                .map(function (task) { return chalk.green(task); })
                .join("\", \"") +
            "\"");
            grunt.task.run(options.tasks);
        }
        else
            grunt.log.writeln(chalk.gray("Nothing changed."));
    });
};

