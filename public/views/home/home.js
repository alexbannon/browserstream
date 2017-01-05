'use strict';

angular.module('browserstream.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', [ '$http', '$scope', '$window', function($http, $scope, $window) {
  console.log('home controller initialized');

  $scope.displaySummary = function(title) {
    title = encodeURI(title);
    $window.location.href = 'https://www.netflix.com/search?q=' + title;
  }

  $http({
  method: 'GET',
  url: '/api/query/netflix'
}).then(function successCallback(response) {
  $scope.titles = response.data;
  console.log(response.data);
    // this callback will be called asynchronously
    // when the response is available
  }, function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
}]);
