module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-coveralls');

    // Project configuration.
    grunt.initConfig({
        copy: {
            instrument: {
                files: [{
                    src: ['test/Unosquare.Tubular.WebTest/**/*', '!test/Unosquare.Tubular.WebTest/**/*.js'],
                    dest: 'instrumented/'
                }]
            }
        },
        instrument: {
            files: [
                'test/Unosquare.Tubular.WebTest/**/*.js',
                'src/Unosquare.Tubular/Javascript/tubular/**/*.js',
                'src/Unosquare.Tubular/Javascript/tubular-odata/**/*.js',
                'src/Unosquare.Tubular/Javascript/tubular-localdata/**/*.js'
            ],
            options: {
                lazy: true,
                basePath: "instrumented"
            }
        },
        'string-replace': {
            dist: {
                files: { 'instrumented/test/Unosquare.Tubular.WebTest/': 'instrumented/test/Unosquare.Tubular.WebTest/**/*.html' },
                options: {
                    replacements: [{
                            pattern: /\/Unosquare\.Tubular\.WebTest\/testApp\.js/g,
                            replacement: '/instrumented/test/Unosquare.Tubular.WebTest/testApp.js'
                        },
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
                keepAlive: true,
                noColor: false,
                collectorPort: 9001,
                webdriverManagerUpdate: true,
                configFile: "test/e2e-tests/protractor.conf.grunt.js"
            },
            remote: {
                options: {
                    coverageDir: 'coverage',
                    args: {
                        baseUrl: 'http://localhost:9000/instrumented/test/Unosquare.Tubular.WebTest/',
                        browser: "firefox"
                            // sauceUser: 'geoperez',
                            // sauceKey: 'dd986cd7-696b-433a-941e-3820d83aa09a'
                    }
                }
            },
            local: {
                options: {
                    args: {
                        baseUrl: "http://localhost:9000/test/Unosquare.Tubular.WebTest/",
                        browser: "chrome",
                        specs: ['test/e2e-tests/tbHttpSpec.js']
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
        }
    });

    grunt.registerTask('test', [
        'copy:instrument',
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
};