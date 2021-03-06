'use strict';

function supportsHtml5Storage() {
  try {
    return 'localStorage' in window && window.localStorage !== null;
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
      var genreArray = [];
      for (var y = 0; y < userSettingsObject.genres.length; y++) {
        if (userSettingsObject.genres[y].selected) {
          genreArray.push(userSettingsObject.genres[y].name);
        }
      }
      this.setStorage('genres', genreArray.join(','));

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
        var domain = '.' + window.location.hostname;
        $cookies.put(key, value, {
          path: '/',
          expires: expireDate,
          domain: domain
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
    },
    clearStorage: function() {
      if ($rootScope.localStorageAvailable === undefined) {
        $rootScope.localStorageAvailable = supportsHtml5Storage();
      }
      if (!$rootScope.localStorageAvailable) {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i];
          var eqPos = cookie.indexOf('=');
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      } else {
        window.localStorage.clear();
      }
    }
  };
}]);
