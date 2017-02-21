'use strict';

angular.module('browserstreams', [
  'ngRoute',
  'browserstreams.home',
  'infinite-scroll',
  'ngAnimate'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}]);
