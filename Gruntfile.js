module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks("gruntify-eslint");
    grunt.loadNpmTasks('grunt-karma');

    // Project configuration.
    grunt.initConfig({
        instrument: {
            files: [
                'test/Unosquare.Tubular.WebTest/testApp.js',
                'src/Unosquare.Tubular/Javascript/tubular*-bundle.js'
                //'src/Unosquare.Tubular/Javascript/tubular/*.js',
                //'src/Unosquare.Tubular/Javascript/tubular-odata/*.js',
                //'src/Unosquare.Tubular/Javascript/tubular-localdata/*.js'
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
            src: ["src/Unosquare.Tubular/Javascript/tubular**/**.js"]
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
                singleRun: true,
                preprocessors: {
                },
                reporters: ['progress', 'jasmine-runner']
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
    // Default task.
    grunt.registerTask('unit', ['karma:dev']);
    grunt.registerTask('unit:ci', ['karma:ci']);
};
