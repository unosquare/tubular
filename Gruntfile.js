var ff = process.env.BROWSER == "firefox";

module.exports = grunt => {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-csslint');

    // Project configuration.
    grunt.initConfig({
        copy: {
            main: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        src: [
                            'src/js/tubular*-bundle.js',
                            'src/js/tubular*-bundle.min.js',
                            'src/css/tubular-bundle.css',
                            'src/css/tubular-bundle.min.css'
                        ],
                        dest: 'dist/',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            }
        },
        coveralls: {
            options: {
                force: true
            },
            ci: {
                src: 'report/coverage/lcov.info'
            }
        },
        csslint: {
          options: {
            quiet: true,
            formatters: [{id:'compact', dest: 'report/csslint/report.txt'}]
          },
          src: ['src/css/**/*.css', '!src/css/**/*min.css']
        },
        eslint: {
            options: {
                configFile: '.eslintrc.json',
                format: 'html',
                outputFile: 'report/eslint/index.html',
                silent: false
            },
            src: ['src/js/tubular*/**/*.js', '!src/**/*.spec.js', '!src/**/templates.js']
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['Firefox']
            },
            ci: {
                browsers: ff ? ['Firefox'] : ['Chrome'],
                singleRun: true

            },
            e2eci: {
              configFile: 'test/e2e/karma.conf.js',
              browsers: ff ? ['Firefox'] : ['Chrome'],
              singleRun: true
            },
            e2e: {
              configFile: 'test/e2e/karma.conf.js',
              singleRun: false
            },
            dev: {
                singleRun: false,
                autoWatch: false,
                preprocessors: {
                },
                reporters: ['progress']
            }
        },
        html2js: {
            options: {

                singleModule: true,
                useStrict: true,
                existingModule: true,
                rename: name => {
                    var pieces = name.split('/');
                    return pieces[pieces.length - 1];
                },
                fileHeaderString: '(function(angular){',
                fileFooterString: '})(angular);',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            main: {
                base: 'src/js/tubular/',
                module: 'tubular.directives',
                src: ['src/js/tubular/**/*.tpl.html'],
                dest: 'src/js/templates.js'
            }
        },
        concat: {
            tubular_js: {
                src: [
                    'src/js/tubular/tubular.js',
                    'src/js/tubular/tubular-directives.js',
                    'src/js/tubular/tubular-models.js',
                    'src/js/templates.js',
                    'src/js/tubular/models/**/*.js',
                    'src/js/tubular/directives/**/*.js',
                    'src/js/tubular/tubular-directives-editors.js',
                    'src/js/tubular/tubular-directives-filters.js',
                    'src/js/tubular/tubular-directives-forms.js',
                    'src/js/tubular/tubular-directives-gridcomponents.js',
                    'src/js/tubular/tubular-directives-gridpager.js',
                    'src/js/tubular/tubular-services.js',
                    'src/js/tubular/filters/**/*.js',
                    'src/js/tubular/interceptors/**/*.js',
                    'src/js/tubular/services/**/*.js',
                    '!src/js/tubular/**/*.spec.js',
                    '!src/js/tubular/**/*.e2e.js'
                ],
                dest: 'src/js/tubular-bundle.js'
            },
            tubular_css: {
                src: [
                    'bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
                    'src/css/tubular/tubular.css'
                ],
                dest: 'src/css/tubular-bundle.css'
            }
        },
        uglify: {
            tubular_js: {
                files: {
                    'src/js/tubular-bundle.min.js': ['src/js/tubular-bundle.es5.js']
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            main: {
                files: {
                    'src/css/tubular-bundle.min.css': ['src/css/tubular-bundle.css']
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    'src/js/**/*.js',
                    'src/js/**/*.html'
                ],
                tasks: ['min'],
                options: {
                    spawn: false
                }
            }
        },
        babel: {
            options: {
                sourceMap: false,
                presets: ['es2015']
            },
            tubular_js: {
                files: {
                    'src/js/tubular-bundle.es5.js': ['src/js/tubular-bundle.js']
                }
            }
        }
    });

    grunt.registerTask('build-js', ['concat:tubular_js']);

    grunt.registerTask('build', ['html2js:main', 'build-js', 'concat:tubular_css']);

    grunt.registerTask('compress', ['uglify:tubular_js']);

    grunt.registerTask('min', ['build', 'babel', 'uglify', 'cssmin:main']);

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('dist', ['build-js', 'min', 'copy']);
    grunt.registerTask('unit', ['karma:dev']);
    grunt.registerTask('unit:ci', ['karma:ci']);

    grunt.registerTask('e2e:ci', ['dist','karma:e2eci']);
    grunt.registerTask('e2e', ['dist','karma:e2e']);
};
