module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-wait');

    // Project configuration.
    grunt.initConfig({
        copy: {
            instrument: {
                files: [{
                    src: ['Unosquare.Tubular.WebTest/**/*', '!Unosquare.Tubular.WebTest/**/*.js'],
                    dest: 'instrumented/'
                }]
            }
        },
        instrument: {
            files: ['Unosquare.Tubular.WebTest/**/*.js', 'dist/**/*.js'],
            options: {
                lazy: true,
                basePath: "instrumented"
            }
        },
        'string-replace': {
            dist: {
                files: { 'instrumented/Unosquare.Tubular.WebTest/': 'instrumented/Unosquare.Tubular.WebTest/**/*.html' },
                options: {
                    replacements: [{
                        pattern: /"\/Unosquare\.Tubular\.WebTest\/testApp\.js/g,
                        replacement: '"/instrumented/Unosquare.Tubular.WebTest/testApp.js'
                    },
                        {
                            pattern: /\.\.\/dist/g,
                            replacement: "/instrumented/dist"
                        }]
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
                configFile: "e2e-tests/protractor.conf.grunt.js",
                keepAlive: true,
                noColor: false,
                collectorPort: 9001,
                coverageDir: 'coverage',
                args: {
                    baseUrl: 'http://localhost:9000/instrumented/Unosquare.Tubular.WebTest/'
                    // sauceUser: 'geoperez',
                    // sauceKey: 'dd986cd7-696b-433a-941e-3820d83aa09a'
                }
            },
            all: {}
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
        'protractor_coverage',
        'makeReport',
        'coveralls:local'
    ]);

    grunt.registerTask('prepare', [
        'copy:instrument',
        'instrument',
        'string-replace'
    ]);
};
