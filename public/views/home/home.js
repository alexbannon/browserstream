'use strict';

angular.module('browserstream.home', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', [ '$http', '$scope', '$window', '$event', function($http, $scope, $window, $event) {
  console.log('home controller initialized');

  $scope.selectedTitleObject = {};
  $scope.displayModal = false;

  $scope.displaySummary = function(titleObject) {
    console.log('helloo');
    $scope.selectedTitleObject = titleObject;
    $scope.displayModal = true;
    // title = encodeURI(title);
    // $window.location.href = 'https://www.netflix.com/search?q=' + title;
  }

  $scope.clickModal = function() {
    console.log('clickity');
    $event.preventDefault()();
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
