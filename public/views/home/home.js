'use strict';

angular.module('browserstreams.home', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$cookies', 'Modal', 'TitlesApi', 'LocalStorage', 'TitleScroll', '$rootScope', '$document', function($scope, $cookies, Modal, TitlesApi, LocalStorage, TitleScroll, $rootScope, $document) {

  var localStorageSelections = LocalStorage.getFromStorage('providerSelections');
  if (localStorageSelections) {
    localStorageSelections = localStorageSelections.split(',');
  } else {
    localStorageSelections = ['netflix'];
  }

  $scope.providers = [{
    name: 'Netflix',
    queryName: 'netflix',
    selected: (localStorageSelections.indexOf('netflix') > -1),
    imageSource: 'http://vignette4.wikia.nocookie.net/smurfs/images/a/a1/Netflix-logo.png/revision/latest?cb=20150508223333'
  },{
    name: 'HBO GO',
    queryName: 'hbo_go',
    selected: (localStorageSelections.indexOf('hbo_go') > -1),
    imageSource: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/HBOGO.svg/2000px-HBOGO.svg.png',
  },{
    name: 'Amazon Prime',
    queryName: 'amazon_prime',
    selected: (localStorageSelections.indexOf('amazon_prime') > -1),
    imageSource: 'http://vignette1.wikia.nocookie.net/logopedia/images/2/26/Amazon-prime.png/revision/latest?cb=20150709185638',
  },{
    name: 'Hulu',
    queryName: 'hulu',
    selected: (localStorageSelections.indexOf('hulu') > -1),
    imageSource: 'https://assetshuluimcom-a.akamaihd.net/kitty-staging/uploads/logo_download/file/7/Hulu_Logo_Option_A.png'
  }];

  $scope.titleScroll = new TitleScroll('top');

  $scope.displaySummary = function(titleObject) {
    $scope.selectedTitleObject = titleObject;
    $scope.displayModal = true;
    $rootScope.bodyClass = true;
    TitlesApi.getAdditionalTitleInfo(titleObject.title_id).then(function(result) {
      $scope.additionalTitleInfo = result.data[0];
    }).catch(function(error) {
      console.log('error retrieving more title info ', error);
    });
  };
  $scope.hideModal = function() {
    $scope.displayModal = false;
    $rootScope.bodyClass = false;
  };

  $scope.selectProvider = function() {
    LocalStorage.setProviderStorage($scope.providers);
    $scope.titleScroll.changeItemsList('top', $scope.providers);
  };

  $scope.loadMoreTitles = function() {
    console.log('should I be busy: ' + $scope.titleScroll.busy);
    $scope.titleScroll.nextPage($scope.providers);
    console.log('load more titles');
  };

  $scope.clickModal = function($event) {
    $event.stopPropagation();
    Modal.handleProviderTitleClick($scope.selectedTitleObject);
  };
  $scope.clickModalProvider = function(provider, $event) {
    $event.stopPropagation();
    Modal.handleProviderTitleClick($scope.selectedTitleObject, provider);
  };

}]);
