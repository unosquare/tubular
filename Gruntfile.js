/// <binding BeforeBuild='html2js:main' />
module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks("gruntify-eslint");
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-html2js');
    

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
                configFile: "test/e2e-tests/protractor.conf.grunt.js"
            },
            remote: {
                options: {
                    coverageDir: 'coverage',
                    args: {
                        baseUrl: 'http://localhost:9000/instrumented/test/Unosquare.Tubular.WebTest/',
                        browser: process.env.TRAVIS_OS_NAME == "osx" ? "chrome" : "firefox"

                    }
                }
            },
            local: {
                options: {
                    args: {
                        baseUrl: "http://localhost:9000/test/Unosquare.Tubular.WebTest/",
                        browser: "firefox"
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
            src: ["src/Unosquare.Tubular/Javascript/tubular*/**/*.js", '!src/**/*.spec.js']
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
                rename: function(name){
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
        }

    });

    grunt.registerTask('test', [
        'instrument',
        'string-replace',
        'connect:server',
        'protractor_coverage:remote',
        'makeReport',
        'coveralls:local'
    ]);

    grunt.registerTask('test-local', [
        'connect:server',
        'protractor_coverage:local'
    ]);

   

    grunt.registerTask("lint", ["eslint"]);
    grunt.registerTask('unit', ['karma:dev']);
    grunt.registerTask('unit:ci', ['karma:ci']);
};
