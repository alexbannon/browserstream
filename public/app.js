'use strict';

angular.module('browserstreams', [
  'ngRoute',
  'browserstreams.home',
  'infinite-scroll',
  'ngAnimate'
])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
  $locationProvider.html5Mode(true);
}])
.run(['$rootScope', function($rootScope){
  // this is to change the API request to be dependent on screen size so its not requesting 30 unnecessary titles
  $rootScope.numFilms = 30;
  if (window && window.screen && window.screen.width && window.screen.height) {
    var titleWidth = Math.floor(window.screen.width / 154);
    titleWidth = titleWidth > 12 ? 12 : titleWidth;
    var titleHeight = Math.ceil((window.screen.height - 119) / 226);
    $rootScope.numFilms = (titleWidth * titleHeight * 1.5);
  }
}]);
