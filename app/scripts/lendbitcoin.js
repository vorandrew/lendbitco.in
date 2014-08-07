'use strict';

angular.module('lendbitcoin', ['ngCookies', 'ui.router', 'percentage'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      }).state('address', {
        url: '/{address:r[\\w]{33}}',
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
  });

angular.module('lendbitcoin')
  .service('_', function ($window) {
    return $window.window._;
  });

angular.module('lendbitcoin')
  .service('RB', function ($window) {
    return $window.window.rippleBonds;
  });

angular.module('lendbitcoin')
  .service('async', function ($window) {
    return $window.window.async;
  });

angular.module('lendbitcoin')
  .service('rootScopeApply', function (_, $rootScope) {
    this.apply = _.throttle($rootScope.$apply, 1000);
  });