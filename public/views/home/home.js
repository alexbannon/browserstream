'use strict';

angular.module('browserstreams.home', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$cookies', 'Modal', 'TitlesApi', 'LocalStorage', 'TitleScroll', '$rootScope', 'UserSettings', function($scope, $cookies, Modal, TitlesApi, LocalStorage, TitleScroll, $rootScope, UserSettings) {

  $scope.userSettings = UserSettings.generateUserSettings();

  $scope.titleScroll = new TitleScroll($scope.userSettings.sortBy, $rootScope.numFilms);

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
    LocalStorage.saveUserSettings($scope.userSettings);
    $scope.titleScroll.changeItemsList($scope.userSettings);
  };

  $scope.searchMovie = function() {
    if ($scope.searchInput) {
      console.log($scope.searchInput);
      TitlesApi.searchForTitle($scope.searchInput).then(function(result){
        console.log(result);
      }).catch(function(err){
        console.log('error searching api: ' + err);
      });
      $scope.searchInput = '';
    }
  };

  $scope.selectProvider = function() {
    LocalStorage.saveUserSettings($scope.userSettings);
    $scope.titleScroll.changeItemsList($scope.userSettings);

  };
  $scope.loadMoreTitles = function() {
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
