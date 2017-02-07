angular.module('browserstreams')

.factory('TitleScroll', function($http) {
  var TitleScroll = function(sort) {
    this.sort = sort;
    this.items = [];
    this.busy = false;
    this.start = 0;
    this.error = false;
  };

  TitleScroll.prototype.nextPage = function(providersArray) {
    if (this.busy) return;
    this.busy = true;
    console.log('loading next page');

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
      console.log('finished');
    }.bind(this)).catch(function(err) {
      console.log(err);
      this.error = true;
    }.bind(this));

  };

  TitleScroll.prototype.changeItemsList = function(newSort, providersArray) {
    this.sort = newSort;
    this.items = [];
    this.start = 0;
    this.nextPage(providersArray);
  };

  return TitleScroll;
});
