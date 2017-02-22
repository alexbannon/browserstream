'use strict';

angular.module('browserstreams.home', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$cookies', 'Modal', 'TitlesApi', 'LocalStorage', 'TitleScroll', '$rootScope', function($scope, $cookies, Modal, TitlesApi, LocalStorage, TitleScroll, $rootScope) {

  var localStorageSelections = LocalStorage.getFromStorage('providerSelections');
  if (localStorageSelections) {
    localStorageSelections = localStorageSelections.split(',');
  } else {
    localStorageSelections = ['netflix'];
  }
  // TODO: break this mofo into a service
  // TODO: download images and place in assets
  $scope.userSettings = {
    providers: [{
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
    }],
    titleType: [{
      name: 'Movies',
      queryName: 'movie',
      selected: true
    }, {
      name: 'TV Shows',
      queryName: 'series',
      selected: true
    }],
    sortBy: 'alphabetical',
    sortList: ['best', 'worst', 'alphabetical'],
    genres: []
  };

  $scope.titleScroll = new TitleScroll($scope.userSettings.sortBy);

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
  $scope.openPrefs = function() {
    $rootScope.bodyClass = true;
    $scope.displayModal = false;
    $scope.showFilter = true;
  };

  $scope.savePrefs = function() {
    $rootScope.bodyClass = false;
    $scope.showFilter = false;
    $scope.titleScroll.changeItemsList($scope.userSettings.sortBy, $scope.userSettings.providers, $scope.userSettings.titleType);
  };

  $scope.selectProvider = function() {
    LocalStorage.setProviderStorage($scope.userSettings.providers);
    $scope.titleScroll.changeItemsList($scope.userSettings.sortBy, $scope.userSettings.providers, $scope.userSettings.titleType);

  };
  // TODO refactor everything into a single $scope.userSettings passable value which is originated in a service on controller initialization.
  $scope.loadMoreTitles = function() {
    // TODO: user controlled selection of scope variable for titleType
    $scope.titleScroll.nextPage($scope.userSettings.providers, $scope.userSettings.titleType);
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
