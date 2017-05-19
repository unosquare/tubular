﻿(function (angular) {
    'use strict';

    angular.module('tubular.directives')
        /**
         * @ngdoc component
         * @name tbGrid
         *
         * @description
         * The `tbGrid` directive is the base to create any grid. This is the root node where you should start
         * designing your grid. Don't need to add a `controller`.
         *
         * @param {string} serverUrl Set the HTTP URL where the data comes.
         * @param {string} serverSaveUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverDeleteUrl Set the HTTP URL where the data will be saved.
         * @param {string} serverSaveMethod Set HTTP Method to save data.
         * @param {int} pageSize Define how many records to show in a page, default 20.
         * @param {string} requestMethod Set HTTP Method to get data.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {string} gridName Grid's name, used to store metainfo in localstorage.
         * @param {string} editorMode Define if grid is read-only or it has editors (inline or popup).
         * @param {bool} showLoading Set if an overlay will show when it's loading data, default true.
         * @param {bool} autoRefresh Set if the grid refresh after any insertion or update, default true.
         * @param {bool} savePage Set if the grid autosave current page, default true.
         * @param {bool} savePageSize Set if the grid autosave page size, default true.
         * @param {bool} saveSearchText Set if the grid autosave search text, default true.
         * @param {array} columns Set an array of TubularColumn to use. Using this attribute will create a template for columns and rows overwritting any template inside.
         */
        .component('tbGrid',
        {
            templateUrl: 'tbGrid.tpl.html',
            transclude: true,
            bindings: {
                serverUrl: '@',
                serverSaveUrl: '@',
                serverDeleteUrl: '@',
                serverSaveMethod: '@',
                pageSize: '=?',
                requestMethod: '@',
                requireAuthentication: '@?',
                name: '@?gridName',
                editorMode: '@?',
                showLoading: '=?',
                autoRefresh: '=?',
                savePage: '=?',
                savePageSize: '=?',
                saveSearchText: '=?',
                columns: '=?'
            },
            controller: 'tbGridController'
        });
})(angular);