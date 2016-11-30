'use strict';

angular.module('browserstream.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', [ '$http', '$scope', function($http, $scope) {
  console.log('home controller initialized');
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
