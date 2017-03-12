'use strict';
angular.module('browserstreams')

.factory('TitleScroll', function($http, $rootScope, $timeout, TitlesApi) {
  var TitleScroll = function(sort, limit) {
    this.sort = sort;
    this.items = [];
    this.userSearch = false;
    this.busy = false;
    this.atBottom = false;
    this.start = 0;
    this.limit = limit;
    this.error = false;
    this.searchError = false;
    this.noDataError = false;
    this.clearErrors = function() {
      this.error = false;
      this.noDataError = false;
      this.searchError = false;
      this.userSearch = false;
      this.atBottom = false;
      this.busy = false;
    }.bind(this);
  };

  TitleScroll.prototype.nextPage = function(providersArray, titleTypeArray, genresArray, emitEvent) {
    if (this.busy || this.error) {
      return;
    }
    this.busy = true;
    var providerCount = 0;
    var url = '/api/query?sort='+this.sort+'&start='+this.start;
    for (var i = 0; i < providersArray.length; i++) {
      if (providersArray[i].selected) {
        providerCount++;
        url+= '&providers=' + providersArray[i].queryName;
      }
    }
    if (providerCount === 0) {
      this.busy = false;
      return;
    }

    var titleCount = 0;

    for (var x = 0; x < titleTypeArray.length; x++) {
      if (titleTypeArray[x].selected) {
        titleCount++;
        url+= '&titletype=' + titleTypeArray[x].queryName;
      }
    }
    if (titleCount === 0) {
      this.busy = false;
      return;
    }

    var turnedOffGenreCount = 0;
    var urlGenreAddition = '';

    for (var y = 0; y < genresArray.length; y++) {
      if (genresArray[y].selected) {
        urlGenreAddition += '&genre=' + genresArray[y].queryName;
      } else {
        turnedOffGenreCount++;
      }
    }
    if (turnedOffGenreCount > 0) {
      url += urlGenreAddition;
    }

    url += '&limit=' + this.limit;

    $http({
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60'
      }
    }).then(function(response) {
      if (this.items.length === 0) {
        if (response.data.length === 0) {
          this.noDataError = true;
        }
        this.items = response.data;
      } else {
        this.items.push(...response.data);
      }
      this.start += this.limit;
      // not the biggest fan, but infinite scroll was firing too quickly before angular could load titles
      $timeout(function(){
        this.busy = false;
      }.bind(this), 100);
      if (emitEvent === 'checkHeight') {
        // fixing ng-infinite-scroll bug on item change
        $rootScope.$emit('itemsNotLongEnough');
      }
    }.bind(this)).catch(function(err) {
      if (err && err.status === 404) {
        this.atBottom = true;
      } else {
        console.log(err);
        this.items = [];
        this.error = true;
      }
    }.bind(this));

  };

  TitleScroll.prototype.changeItemsList = function(userSettings) {
    this.sort = userSettings.sortBy;
    this.clearErrors();
    this.items = [];
    this.start = 0;
    this.nextPage(userSettings.providers, userSettings.titleType, userSettings.genres, 'checkHeight');
  };

  TitleScroll.prototype.search = function(searchTerm) {
    var self = this;
    self.busy = true;
    this.userSearch = true;
    if (searchTerm) {
      TitlesApi.searchForTitle(searchTerm).then(function(result){
        if (!result || result.data.length === 0) {
          self.searchError = true;
        } else {
          self.clearErrors();
        }
        self.items = result.data;
      }).catch(function(err){
        self.busy = false;
        self.error = true;
        console.log('error searching api: ' + err);
      });
    }
  };

  return TitleScroll;
});
