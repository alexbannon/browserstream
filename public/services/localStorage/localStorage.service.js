'use strict';

function supportsHtml5Storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

angular.module('browserstreams')

.service('LocalStorage', ['$window', '$rootScope', '$cookies', function($window, $rootScope, $cookies) {
  return {
    saveUserSettings(userSettingsObject) {
      var providersArray = [];
      for (var i = 0; i < userSettingsObject.providers.length; i++) {
        if (userSettingsObject.providers[i].selected) {
          providersArray.push(userSettingsObject.providers[i].queryName);
        }
      }
      this.setStorage('providerSelections', providersArray.join(','));
      var titleTypeArray = [];
      for (var x = 0; x < userSettingsObject.titleType.length; x++) {
        if (userSettingsObject.titleType[x].selected) {
          titleTypeArray.push(userSettingsObject.titleType[x].queryName);
        }
      }
      this.setStorage('titleTypes', titleTypeArray.join(','));
      this.setStorage('sortBy', userSettingsObject.sortBy);
    },
    setStorage: function(key, value) {
      if (!key || !value) {
        return;
      }
      if ($rootScope.localStorageAvailable === undefined) {
        $rootScope.localStorageAvailable = supportsHtml5Storage();
      }
      if (!$rootScope.localStorageAvailable) {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 2555);
        $cookies.put(key, value, {
          path: '/',
          expires: expireDate
        });
      } else {
        $window.localStorage[key] = value;
      }
    },
    getFromStorage: function(key) {
      if ($rootScope.localStorageAvailable === undefined) {
        $rootScope.localStorageAvailable = supportsHtml5Storage();
      }
      var valueToReturn = false;
      if (!$rootScope.localStorageAvailable) {
        valueToReturn = $cookies.get(key);
      } else {
        valueToReturn = $window.localStorage[key];
      }
      return valueToReturn;
    }
  };
}]);
