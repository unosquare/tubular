/// <binding ProjectOpened='watch:scripts' />
module.exports = function(grunt) {
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

    // Project configuration.
    grunt.initConfig({
        instrument: {
            files: [
                'test/Unosquare.Tubular.WebTest/testApp.js',
                'src/Unosquare.Tubular/Javascript/tubular*-bundle.js'
                //'src/Unosquare.Tubular/Javascript/tubular/*.js',
            ],
            options: {
                basePath: 'instrumented/'
            }
        },
        'string-replace': {
            dist: {
                files: { 'instrumented/': 'test/Unosquare.Tubular.WebTest/index*.html' },
                options: {
                    replacements: [
                        {
                            pattern: /\.\.\/\.\.\/src\/Unosquare\.Tubular\/Javascript\/tubular/g,
                            replacement: '/instrumented/src/Unosquare.Tubular/Javascript/tubular'
                        }
                    ]
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: 'localhost',
                    base: ''
                }
            }
        },
        protractor_coverage: {
            options: {
                noColor: false,
                keepAlive: false,
                collectorPort: 9001,
                webdriverManagerUpdate: true,
                configFile: 'test/e2e-tests/protractor.conf.grunt.js'
            },
            remote: {
                options: {
                    coverageDir: 'coverage',
                    args: {
                        baseUrl: 'http://localhost:9000/instrumented/test/Unosquare.Tubular.WebTest/',
                        browser: process.env.TRAVIS_OS_NAME == 'osx' ? 'chrome' : 'firefox'

                    }
                }
            },
            local: {
                options: {
                    args: {
                        baseUrl: 'http://localhost:9000/test/Unosquare.Tubular.WebTest/',
                        browser: 'firefox'
                    }
                }
            }
        },
        makeReport: {
            src: 'coverage/*.json',
            options: {
                type: 'lcov',
                dir: 'coverage',
                print: 'detail'
            }
        },
        coveralls: {
            options: {
                force: true
            },
            local: {
                src: 'coverage/*.info'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc.json',
                format: 'html',
                outputFile: 'report/eslint/index.html',
                silent: true
            },
            src: ['src/Unosquare.Tubular/Javascript/tubular*/**/*.js', '!src/**/*.spec.js']
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                browsers: ['Firefox']
            },
            ci: {
                singleRun: true
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
                base: 'src/Unosquare.Tubular/Javascript/tubular/',
                module: 'tubular.directives',
                singleModule: true,
                useStrict: true,
                existingModule: true,
                rename: function(name) {
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
                src: ['src/Unosquare.Tubular/Javascript/tubular/**/*.tpl.html'],
                dest: 'src/Unosquare.Tubular/Javascript/tubular/templates.js'
            }
        },
        concat: {
            tubular_js: {
                src: [
                    'src/Unosquare.Tubular/Javascript/tubular/tubular.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-directives.js',
                    'src/Unosquare.Tubular/Javascript/tubular/templates.js',
                    'src/Unosquare.Tubular/Javascript/tubular/directives/**/*.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-directives-editors.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-directives-filters.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-directives-forms.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-directives-gridcomponents.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-directives-gridpager.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-models.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-services.js',
                    'src/Unosquare.Tubular/Javascript/tubular/interceptors/**/*.js',
                    'src/Unosquare.Tubular/Javascript/tubular/services/**/*.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-services-http.js',
                    'src/Unosquare.Tubular/Javascript/tubular/interceptors/auth.js',
                    'src/Unosquare.Tubular/Javascript/tubular/tubular-services-i18n.js',
                    '!src/Unosquare.Tubular/Javascript/tubular/**/*.spec.js',
                    '!src/Unosquare.Tubular/Javascript/tubular/**/*.e2e.js'
                ],
                dest: 'src/Unosquare.Tubular/Javascript/tubular-bundle.js'
            },
            chart_js: {
                src: [
                    'bower_components/angular-chart.js/dist/angular-chart.js',
                    'src/Unosquare.Tubular/Javascript/tubular-chart/tubular-directives-chartjs.js'
                ],
                dest: 'src/Unosquare.Tubular/Javascript/tubular-chartjs-bundle.js'
            },
            highchart_js: {
                src: [
                    'bower_components/highchart-ng/dist/highcharts-ng.js',
                    'src/Unosquare.Tubular/Javascript/tubular-chart/tubular-directives-highcharts.js'
                ],
                dest: 'src/Unosquare.Tubular/Javascript/tubular-highcharts-bundle.js'
            },
            tubular_css: {
                src: [
                    'bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
                    'src/Unosquare.Tubular/Css/angular-chartjs/angular-chart.css',
                    'src/Unosquare.Tubular/Css/tubular/tubular.css'
                ],
                dest: 'src/Unosquare.Tubular/Css/tubular-bundle.css'
            }
        },
        uglify: {
            tubular_js: {
                files: {
                    'src/Unosquare.Tubular/Javascript/tubular-bundle.min.js': ['src/Unosquare.Tubular/Javascript/tubular-bundle.js']
                }
            },
            chart_js: {
                files: {
                    'src/Unosquare.Tubular/Javascript/tubular-chartjs-bundle.min.js': ['src/Unosquare.Tubular/Javascript/tubular-chartjs-bundle.js']
                }
            },
            highchart_js: {
                files: {
                    'src/Unosquare.Tubular/Javascript/tubular-highcharts-bundle.min.js': ['src/Unosquare.Tubular/Javascript/tubular-highcharts-bundle.js']
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
                    'src/Unosquare.Tubular/Css/tubular-bundle.min.css': ['src/Unosquare.Tubular/Css/tubular-bundle.css']
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    'src/Unosquare.Tubular/Javascript/**/*.js',
                    'src/Unosquare.Tubular/Javascript/**/*.html'
                ],
                tasks: ['min'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.registerTask('test',
    [
        'instrument',
        'string-replace',
        'connect:server',
        'protractor_coverage:remote',
        'makeReport',
        'coveralls:local'
    ]);

    grunt.registerTask('test-local',
    [
        'connect:server',
        'protractor_coverage:local'
    ]);

    grunt.registerTask('build-js', ['concat:tubular_js', 'concat:chart_js', 'concat:highchart_js']);

    grunt.registerTask('build', ['html2js:main', 'build-js', 'concat:tubular_css']);

    grunt.registerTask('compress', ['uglify:tubular_js', 'uglify:chart_js', 'uglify:highchart_js']);

    grunt.registerTask('min', ['build', 'uglify', 'cssmin:main']);

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('unit', ['karma:dev']);
    grunt.registerTask('unit:ci', ['karma:ci']);
};
