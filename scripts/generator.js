﻿(function() {
    'use strict';

    angular.module('app.generator', ['tubular.services'])
        // This Factory and the pluker button is based on Angular Documentation
        .factory('formPostData', [
            '$document', function($document) {
                return function(url, newWindow, fields) {
                    /**
                     * If the form posts to target="_blank", pop-up blockers can cause it not to work.
                     * If a user choses to bypass pop-up blocker one time and click the link, they will arrive at
                     * a new default plnkr, not a plnkr with the desired template.  Given this undesired behavior,
                     * some may still want to open the plnk in a new window by opting-in via ctrl+click.  The
                     */
                    var target = newWindow ? '_blank' : '_self';
                    var form = angular.element('<form style="display: none;" method="post" action="' + url + '" target="' + target + '"></form>');
                    angular.forEach(fields, function(value, name) {
                        var input = angular.element('<input type="hidden" name="' + name + '">');
                        input.attr('value', value);
                        form.append(input);
                    });
                    $document.find('body').append(form);
                    form[0].submit();
                    form.remove();
                };
            }
        ]).service('tubularGenerator', [
            'tubularTemplateService', 'formPostData', function (tubularTemplateService, formPostData) {
                var me = this;

                me.DefaultJs = "angular.module('app', ['ngRoute','tubular']).config(['$routeProvider', function($routeProvider) {$routeProvider.when('/', {templateUrl: 'grid.html',}).otherwise({redirectTo: '/'}); } ]);";
                me.DefaultReadme = '#Tubular WebApp\r\nYou can add your content now. Create more views @ [Tubular](http://unosquare.github.io/tubular)';

                me.createColumns = function(model, scope) {
                    scope.columns = tubularTemplateService.createColumns(model);
                };

                me.runGridTemplate = function (scope) {
                    scope.uiOptions.dataUrl = scope.dataUrl;
                    
                    return tubularTemplateService.generateGrid(scope.columns, scope.uiOptions);
                };

                me.runFormTemplate = function (scope) {
                    scope.formOptions.dataUrl = scope.dataUrl;
                    
                    return tubularTemplateService.generateForm(scope.columns, scope.formOptions);
                };

                me.exportPluker = function(files) {
                    var postData = {};

                    angular.forEach(files, function(file) {
                        postData['files[' + file.name + ']'] = file.content;
                    });

                    postData['tags[0]'] = "angularjs";
                    postData['tags[1]'] = "tubular";
                    postData['tags[2]'] = "bootstrap";
                    postData['tags[3]'] = "autogenerated";
                    postData.private = true;
                    postData.description = "Tubular Sample";

                    formPostData('http://plnkr.co/edit/?p=preview', false, postData);
                };
            }
        ]);
})();