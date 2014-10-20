
/* global module: true */
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadTasks("../tasks");

    grunt.initConfig({
        copy: {
            "foo": { src: "src/foo.txt", dest: "build/foo.txt" },
            "bar": { src: "src/bar.txt", dest: "build/bar.txt" },
            "multi": { expand: true, cwd: 'src/multi', src: "**/*", dest: "build/multi/" }
        },
        newer: {
            "foo": {
                src: [ "src/foo.txt" ],
                dest: "build/foo.txt",
                options: { tasks: [ "copy:foo" ] }
            },
            "bar": {
                src: [ "src/bar.txt" ],
                dest: "build/bar.txt",
                options: { tasks: [ "copy:bar" ] }
            },
            "multi": {
                src: [ "src/multi/**/*.txt" ],
                dest: [ "build/multi/**/*.txt", "build/multi/animals/*.txt" ],
                options: { tasks: [ "copy:multi" ] }
            }
        },
        watch: {
            "all": {
                files: [ "src/*.txt" ],
                tasks: [ "newer" ]
            }
        },
        clean: {
            clean:     [ "build" ],
            distclean: [ "node_modules" ]
        }
    });

    grunt.registerTask("default", [ "newer" ]);
};

