'use strict';

describe('Module: tubular.services', () => {


  var $http, result;

  beforeEach(() => {
    module('ui.bootstrap');
    module(function(_$httpProvider_){ $http = _$httpProvider_;});
    module('tubular.services');
    inject();
  });

  it('should register auth interceptor', () => {
      expect($http.interceptors[0]).toBe('tubularAuthInterceptor')
  });

  it('should register nocache interceptor', () => {
      expect($http.interceptors[1]).toBe('tubularNoCacheInterceptor')
  });


});
