angular.module('browserstreams')

.factory('TitleScroll', function($http, $rootScope) {
  var TitleScroll = function(sort) {
    this.sort = sort;
    this.items = [];
    this.busy = false;
    this.start = 0;
    this.error = false;
  };

  TitleScroll.prototype.nextPage = function(providersArray, emitEvent) {
    if (this.busy || this.error) return;
    this.busy = true;
    var count = 0;
    var url = '/api/query?sort='+this.sort+'&start='+this.start;
    for (var i = 0; i < providersArray.length; i++) {
      if (providersArray[i].selected) {
        count++;
        url+= '&providers=' + providersArray[i].queryName;
      }
    }
    if (count === 0) {
      this.busy = false;
      return;
    }

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
      this.start += 30;
      this.busy = false;
      if (emitEvent) {
        // fixing ng-infinite-scroll bug on item change
        $rootScope.$emit('itemsNotLongEnough');
      }
    }.bind(this)).catch(function(err) {
      this.busy = false;
      this.error = true;
    }.bind(this));

  };

  TitleScroll.prototype.changeItemsList = function(newSort, providersArray) {
    this.sort = newSort;
    this.error = false;
    this.items = [];
    this.start = 0;
    this.nextPage(providersArray, true);
  };

  return TitleScroll;
});
