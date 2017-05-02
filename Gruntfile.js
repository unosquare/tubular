/// <binding ProjectOpened='watch:scripts' />
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
        instrument: {
            files: [
                'test/Unosquare.Tubular.WebTest/testApp.js',
                'src/js/tubular*-bundle.js'
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
                            replacement: '/instrumented/src/js/tubular'
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
                        browser: process.env.TRAVIS_OS_NAME === 'osx' ? 'chrome' : 'firefox'

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
        coveralls: {
            options: {
                force: true
            },
            local: {
                src: 'report/coverage/*.info'
            }
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
            },
            chartjs: {
                base: 'src/js/tubular-chart/chartjs/',
                module: 'tubular-chart.directives',
                src: ['src/js/tubular-chart/chartjs/**/*.tpl.html'],
                dest: 'src/js/templates-chartjs.js'
            }
        },
        concat: {
            tubular_js: {
                src: [
                    'src/js/tubular/tubular.js',
                    'src/js/tubular/tubular-directives.js',
                    'src/js/templates.js',
                    'src/js/tubular/directives/**/*.js',
                    'src/js/tubular/tubular-directives-editors.js',
                    'src/js/tubular/tubular-directives-filters.js',
                    'src/js/tubular/tubular-directives-forms.js',
                    'src/js/tubular/tubular-directives-gridcomponents.js',
                    'src/js/tubular/tubular-directives-gridpager.js',
                    'src/js/tubular/tubular-models.js',
                    'src/js/tubular/tubular-services.js',
                    'src/js/tubular/interceptors/**/*.js',
                    'src/js/tubular/services/**/*.js',
                    'src/js/tubular/tubular-services-http.js',
                    'src/js/tubular/interceptors/auth.js',
                    'src/js/tubular/tubular-services-i18n.js',
                    '!src/js/tubular/**/*.spec.js',
                    '!src/js/tubular/**/*.e2e.js'
                ],
                dest: 'src/js/tubular-bundle.js'
            },
            chart_js: {
                src: [
                    'bower_components/angular-chart.js/dist/angular-chart.js',
                    'src/js/tubular-chart/chartjs/*.module.js',
                    'src/js/templates-chartjs.js',
                    'src/js/tubular-chart/chartjs/*.js'
                ],
                dest: 'src/js/tubular-chartjs-bundle.js'
            },
            highchart_js: {
                src: [
                    'bower_components/highchart-ng/dist/highcharts-ng.js',
                    'src/js/tubular-chart/tubular-directives-highcharts.js'
                ],
                dest: 'src/js/tubular-highcharts-bundle.js'
            },
            tubular_css: {
                src: [
                    'bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css',
                    'src/css/angular-chartjs/angular-chart.css',
                    'src/css/tubular/tubular.css'
                ],
                dest: 'src/css/tubular-bundle.css'
            }
        },
        uglify: {
            tubular_js: {
                files: {
                    'src/js/tubular-bundle.min.js': ['src/js/tubular-bundle.js']
                }
            },
            chart_js: {
                files: {
                    'src/js/tubular-chartjs-bundle.min.js': ['src/js/tubular-chartjs-bundle.js']
                }
            },
            highchart_js: {
                files: {
                    'src/js/tubular-highcharts-bundle.min.js': ['src/js/tubular-highcharts-bundle.js']
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
        }
    });

    grunt.registerTask('test',
        [
            'instrument',
            'string-replace',
            'connect:server',
            'protractor_coverage:remote',
            'coveralls:local'
        ]);

    grunt.registerTask('test-local',
        [
            'connect:server',
            'protractor_coverage:local'
        ]);

    grunt.registerTask('build-js', ['concat:tubular_js', 'concat:chart_js', 'concat:highchart_js']);

    grunt.registerTask('build', ['html2js:main', 'html2js:chartjs', 'build-js', 'concat:tubular_css']);

    grunt.registerTask('compress', ['uglify:tubular_js', 'uglify:chart_js', 'uglify:highchart_js']);

    grunt.registerTask('min', ['build', 'uglify', 'cssmin:main']);

    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('dist', ['build-js', 'min', 'copy']);
    grunt.registerTask('unit', ['karma:dev']);
    grunt.registerTask('unit:ci', ['karma:ci']);
};