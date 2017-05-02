(function (angular) {
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
         * @param {function} onBeforeGetData Callback to execute before to get data from service.
         * @param {string} requestMethod Set HTTP Method to get data.
         * @param {string} serviceName Define Data service (name) to retrieve data, defaults `tubularHttp`.
         * @param {bool} requireAuthentication Set if authentication check must be executed, default true.
         * @param {string} gridName Grid's name, used to store metainfo in localstorage.
         * @param {string} editorMode Define if grid is read-only or it has editors (inline or popup).
         * @param {bool} showLoading Set if an overlay will show when it's loading data, default true.
         * @param {bool} autoRefresh Set if the grid refresh after any insertion or update, default true.
         * @param {bool} savePage Set if the grid autosave current page, default true.
         * @param {bool} savePageSize Set if the grid autosave page size, default true.
         * @param {bool} saveSearchText Set if the grid autosave search text, default true.
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
                onBeforeGetData: '=?',
                requestMethod: '@',
                dataServiceName: '@?serviceName',
                requireAuthentication: '@?',
                name: '@?gridName',
                editorMode: '@?',
                showLoading: '=?',
                autoRefresh: '=?',
                savePage: '=?',
                savePageSize: '=?',
                saveSearchText: '=?'
            },
            controller: 'tbGridController'
        });
})(angular);