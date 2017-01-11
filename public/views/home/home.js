'use strict';

angular.module('browserstream.home', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$cookies', 'Modal', 'TitlesApi', function($scope, $cookies, Modal, TitlesApi) {

  $scope.providers = [{
    name: 'Netflix',
    queryName: 'netflix',
    selected: true,
    imageSource: 'http://vignette4.wikia.nocookie.net/smurfs/images/a/a1/Netflix-logo.png/revision/latest?cb=20150508223333'
  },{
    name: 'HBO GO',
    queryName: 'hbogo',
    selected: false,
    imageSource: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/HBOGO.svg/2000px-HBOGO.svg.png',
  },{
    name: 'Amazon Prime',
    queryName: 'amazonprime',
    selected: false,
    imageSource: 'http://vignette1.wikia.nocookie.net/logopedia/images/2/26/Amazon-prime.png/revision/latest?cb=20150709185638',
  },{
    name: 'Hulu',
    queryName: 'hulu',
    selected: false,
    imageSource: 'https://assetshuluimcom-a.akamaihd.net/kitty-staging/uploads/logo_download/file/7/Hulu_Logo_Option_A.png'
  }];

  $scope.displaySummary = function(titleObject) {
    $scope.selectedTitleObject = titleObject;
    $scope.displayModal = true;
  }

  $scope.selectProvider = function(providerIndex) {
    console.log('you selected: ' + $scope.providers[providerIndex].name);
  }

  $scope.clickModal = function($event) {
    $event.stopPropagation();
    Modal.handleProviderTitleClick($scope.selectedTitleObject);
  }

  TitlesApi.requestTitles($scope.providers).then(function successCallback(response) {
    $scope.titles = response.data;
  }, function errorCallback(response) {
    console.log(response);
  });

}]);
