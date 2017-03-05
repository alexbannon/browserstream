'use strict';

angular.module('browserstreams', [
  'ngRoute',
  'browserstreams.home',
  'browserstreams.searchResults',
  'infinite-scroll',
  'ngAnimate'
])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}])
.run(['$rootScope', function($rootScope){
  var fake;
  // this is to change the API request to be dependent on screen size so its not requesting unnecessary titles
  $rootScope.numFilms = 30;
  var width = 770, height = 1023;
  if (window && window.innerWidth && window.innerHeight) {
    width = window.innerWidth;
    height = window.innerHeight;
  } else if (window && window.screen && window.screen.width && window.screen.height) {
    width = window.screen.width;
    height = window.screen.height;
  }
  var titleWidth = Math.floor(width / 154);
  var titleHeight = Math.ceil((height - 119) / 226);
  $rootScope.numFilms = (titleWidth * titleHeight * 1.2);

  $rootScope.numFilms = $rootScope.numFilms >= 120 ? 120 : $rootScope.numFilms;
  // round up to tens place to reduce clutter in caching system
  $rootScope.numFilms = (Math.ceil($rootScope.numFilms / 10) * 10);
}]);
