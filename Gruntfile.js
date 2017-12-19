const ff = process.env.BROWSER == "firefox";

module.exports = grunt => {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-protractor-coverage');


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
                            'src/css/tubular-bundle.css',
                            'src/css/tubular.plain.css',
                        ],
                        dest: 'dist/',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            },
            integration: {
                files: [
                    {
                        expand: true,
                        src: [
                            'src/js/tubular*-bundle.js',
                            'src/css/tubular-bundle.css',
                            'src/css/tubular.plain.css',
                        ],
                        dest: 'test/integration/tbnodejs/public/javascripts',
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
                formatters: [{ id: 'compact', dest: 'report/csslint/report.txt' }]
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
                    'src/js/tubular/tubular-core.js',
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
                    '!src/js/tubular/**/*.e2e.js',
                ],
                dest: 'src/js/tubular-bundle.js'
            },
            tubular_css: {
                src: [
                    'node_modules/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
                    'src/css/tubular/tubular.css'
                ],
                dest: 'src/css/tubular-bundle.css'
            },
            tubular_core_css: {
                src: [
                    'src/css/tubular/tubular.css'
                ],
                dest: 'src/css/tubular.plain.css'
            }
        },
        babel: {
            options: {
                sourceMap: false,
                presets: ['es2015']
            },
            tubular_js: {
                files: {
                    'dist/tubular-bundle.es5.js': ['src/js/tubular-bundle.js']
                }
            }
        },
        protractor_coverage: {
            options: {
                keepAlive: true,
                directConnect: true,
                collectorPort: 9001,
                webdriverManagerUpdate: true,
                // coverageDir: 'report/e2e/coverage',
                args: {
                    baseUrl: 'http://localhost:9000'
                }
            },
            local: {
                options: {
                    configFile: './test/integration/tbnodejs/protractor.conf.js'
                }
            }
        }
    });

    grunt.registerTask('lint', ['eslint']);

    grunt.registerTask('build', ['html2js:main', 'concat:tubular_js', 'concat:tubular_css', 'concat:tubular_core_css']);

    grunt.registerTask('dist', ['build', 'babel', 'copy']);

    grunt.registerTask('unit', ['karma:dev']);
    grunt.registerTask('unit:ci', ['karma:ci']);

    grunt.registerTask('e2e:ci', ['dist', 'karma:e2eci']);
    grunt.registerTask('e2e', ['dist', 'karma:e2e']);

    grunt.registerTask('server', 'Start web server for express app', function () {
        grunt.log.writeln('Started web server on port 9000');
        require('./test/integration/tbnodejs/app.js').listen(9000);
    });


    grunt.registerTask('e2e-nodejs', ['copy:integration', 'server', 'protractor_coverage:local']);

    grunt.registerTask('local-check', ['dist', 'unit:ci', 'e2e:ci', 'eslint']);
};
