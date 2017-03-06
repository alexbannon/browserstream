'use strict';

angular.module('browserstreams.home', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  });
}])

.controller('HomeCtrl', ['$scope', '$cookies', 'Modal', 'TitlesApi', 'LocalStorage', 'TitleScroll', '$rootScope', 'UserSettings', '$location', function($scope, $cookies, Modal, TitlesApi, LocalStorage, TitleScroll, $rootScope, UserSettings, $location) {

  $scope.search = {
    searchInput: undefined
  };

  $scope.userSettings = UserSettings.generateUserSettings();
  $scope.changeTracking = {
    changesMade: false
  };

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
  $scope.savePrefs = function() {
    $rootScope.bodyClass = false;
    $scope.showPrefs = false;
    if ($scope.changeTracking.changesMade) {
      LocalStorage.saveUserSettings($scope.userSettings);
      $scope.titleScroll.changeItemsList($scope.userSettings);
      $scope.changeTracking.changesMade = false;
    }
  };

  $scope.searchMovie = function() {
    if ($scope.search.searchInput) {
      $location.path('/search/' + $scope.search.searchInput);
    }
  };

  $scope.selectProvider = function() {
    LocalStorage.saveUserSettings($scope.userSettings);
    $scope.titleScroll.changeItemsList($scope.userSettings);
  };
  $scope.loadMoreTitles = function() {
    $scope.titleScroll.nextPage($scope.userSettings.providers, $scope.userSettings.titleType, $scope.userSettings.genres);
  };

  $scope.clickModal = function($event, providerOverride, titleObjectOverride) {
    $event.stopPropagation();
    var titleObject = titleObjectOverride || $scope.selectedTitleObject;
    Modal.handleProviderTitleClick(titleObject, providerOverride);
    $scope.displayModal = false;
  };

  $scope.openFilter = function(whichFilter) {
    $scope.showPrefs = true;
    $scope.filterName = whichFilter;
    $scope.headerProperName = '';
    $scope.activeFilterCount = 0;
    $scope.filterOptionsCount = 0;

    switch (whichFilter) {
      case 'genres':
        $scope.headerProperName = 'Filter By Genres';
        break;
      case 'titleType':
        $scope.headerProperName = 'Filter By Video Type';
        break;
      case 'sortBy':
        $scope.headerProperName = 'Sort By...';
        return;
      default:
        $scope.showPrefs = false;
    }
    $scope.filter = $scope.userSettings[whichFilter];
    for (var i = 0; i < $scope.userSettings[whichFilter].length; i++) {
      $scope.filterOptionsCount++;
      if ($scope.userSettings[whichFilter][i].selected) {
        $scope.activeFilterCount++;
      }
    }
  };

  $scope.allOn = function(filter) {
    var newCount = 0;
    if (filter === 'genres') {
      for (var i = 0; i < $scope.userSettings[filter].length; i++) {
        newCount++;
        $scope.userSettings[filter][i].selected = true;
      }
      $scope.activeFilterCount = newCount;
    }
  };

  $scope.flipFilter = function(filterItem) {
    if ((filterItem.selected && $scope.activeFilterCount > 1) || !filterItem.selected) {
      if (filterItem.selected) {
        $scope.activeFilterCount--;
      } else {
        $scope.activeFilterCount++;
      }
      filterItem.selected = !filterItem.selected;
    }
  };

  $scope.clearFilters = function() {
    $scope.userSettings = UserSettings.generateUserSettings(true);
  };
}]);
