'use strict';

angular.module('browserstreams', [
  'ngRoute',
  'browserstreams.home'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}]);
