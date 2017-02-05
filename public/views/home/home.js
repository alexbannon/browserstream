'use strict';

angular.module('browserstreams.home', ['ngRoute', 'ngCookies'])

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
    queryName: 'hbo_go',
    selected: true,
    imageSource: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/HBOGO.svg/2000px-HBOGO.svg.png',
  },{
    name: 'Amazon Prime',
    queryName: 'amazon_prime',
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
    TitlesApi.getAdditionalTitleInfo(titleObject.title_id).then(function(result) {
      $scope.additionalTitleInfo = result;
    }).catch(function(error) {
      console.log('error retrieving more title info ', error);
    });
  };
  $scope.hideModal = function() {
    $scope.displayModal = false;
  };

  $scope.selectProvider = function() {
    callTitlesApi();
  };

  $scope.clickModal = function($event) {
    $event.stopPropagation();
    Modal.handleProviderTitleClick($scope.selectedTitleObject);
  };

  function callTitlesApi() {
    TitlesApi.requestTitles($scope.providers, 'top', 0).then(function successCallback(response) {
      $scope.titles = response.data;
    }, function errorCallback(error) {
      if (error.message && error.message === 'no provider selected') {
        $scope.titles = [];
        // $scope.providers[0].selected = true;
      }
      console.log(error);
    });
  }
  callTitlesApi();

}]);
