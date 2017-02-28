angular.module('browserstreams')

.factory('TitleScroll', function($http, $rootScope, $timeout) {
  var TitleScroll = function(sort, limit) {
    this.sort = sort;
    this.items = [];
    this.busy = false;
    this.start = 0;
    this.limit = limit;
    this.error = false;
  };

  TitleScroll.prototype.nextPage = function(providersArray, titleTypeArray, emitEvent) {
    if (this.busy || this.error) return;
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
        this.items = response.data;
      } else {
        this.items.push(...response.data);
      }
      this.start += this.limit;
      // not the biggest fan, but infinite scroll was firing too quickly before angular could load titles
      $timeout(function(){
        this.busy = false;
      }.bind(this), 50);
      if (emitEvent) {
        // fixing ng-infinite-scroll bug on item change
        $rootScope.$emit('itemsNotLongEnough');
      }
    }.bind(this)).catch(function(err) {
      console.log(err);
      this.busy = false;
      this.error = true;
    }.bind(this));

  };

  TitleScroll.prototype.changeItemsList = function(userSettings) {
    this.sort = userSettings.sortBy;
    this.error = false;
    this.items = [];
    this.start = 0;
    this.nextPage(userSettings.providers, userSettings.titleType, true);
  };

  return TitleScroll;
});
