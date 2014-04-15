'use strict';

angular.module('BeerPallsApp').
controller('BeerHubCtrl', function ($scope, $http, $routeParams, $filter) {

  $scope.user = $routeParams.user;

  var initArray = function(arraySize){
    var array = [];
    while(arraySize--) {
      array.push([]);
    }
    return array;
  };

  var filter = function(message){
    return /^feat.+|^chore.+|^style.+|^fix.+|^test.+/.test(message);
  };

  $scope.period = {};
  $scope.commits = [];
  var lastYearArr = initArray(366);
  var yearArr = initArray(12);
  var weekArr = initArray(7);
  var dayArr = initArray(24);
  var weekhoursArr = [initArray(24), initArray(24), initArray(24), initArray(24), initArray(24), initArray(24), initArray(24)];

  $scope.analytics = {
    'yearArr': yearArr,
    'weekArr': weekArr,
    'dayArr': dayArr,
    'weekhoursArr': weekhoursArr,
    'lastYearArr': lastYearArr,
    'year': {},
    'month': {},
    'week': {}
  };

  $http.get('https://api.github.com/repos/' + $scope.user + '/beerhub/commits', {})
  .success(function(commits){
    _.pluck(commits, 'commit').forEach(function(commit){
      if (!filter(commit.message)){
        var date = new Date(commit.author.date);

        var c = {
          'date': commit.author.date,
          'message': commit.message,
          'author': commit.author.name,
          'email': commit.author.email
        };

        var hour = date.getHours();
        var day = date.getDay();
        var month = date.getMonth();

        $scope.analytics['yearArr'][month].push(c);
        $scope.analytics['weekArr'][day].push(c);
        $scope.analytics['dayArr'][hour].push(c);
        $scope.analytics['weekhoursArr'][day][hour].push(c);

        var now = new Date();
        var oneYearAgo = new Date();
        var oneMonthAgo = new Date();
        var oneWeekAgo = new Date();
        oneYearAgo.setYear(now.getFullYear() - 1);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        oneWeekAgo.setDate(now.getDate() - 7);
        oneYearAgo.setHours(0,0,0);
        oneMonthAgo.setHours(0,0,0);
        oneWeekAgo.setHours(0,0,0);
        $scope.firstDay = oneYearAgo.getDay();

        var index = Math.floor((date - oneYearAgo) / (24 * 60 * 60 * 1000));
        if (index >= 0) {
          $scope.analytics['lastYearArr'][index].push(c);
          if ($scope.analytics['year'][c.message] > 0) {
            $scope.analytics['year'][c.message]++;
          }
          else {
            $scope.analytics['year'][c.message] = 1;
          }
        }

        if (oneMonthAgo <= new Date(c.date)) {
          if ($scope.analytics['month'][c.message] > 0) {
            $scope.analytics['month'][c.message]++;
          }
          else {
            $scope.analytics['month'][c.message] = 1;
          }
        }
        if (oneWeekAgo <= new Date(c.date)) {
          if ($scope.analytics['week'][c.message] > 0) {
            $scope.analytics['week'][c.message]++
          }
          else {
            $scope.analytics['week'][c.message] = 1;
          }

        }
        $scope.commits.push(c);
      }
    });

    $scope.maxLastYear = getMax($scope.analytics.lastYearArr);
    $scope.maxYear = getMax($scope.analytics.yearArr);
    $scope.maxWeek = getMax($scope.analytics.weekArr);
    $scope.maxDay = getMax($scope.analytics.dayArr);
    $scope.maxWeekHours = getMaxDouble($scope.analytics.weekhoursArr);

    getStreaks($scope.analytics.lastYearArr);

    $scope.period.name = 'week';
    $scope.contributionBeers = getDayBeerArray($scope.analytics[$scope.period.name]);
    
  });

  $scope.totalContributions = 0;

  var getStreaks = function(lastYearArr){
    var total = 0;

    var longestStreak = {
      'startIndex': undefined,
      'endIndex': undefined,
      'days': 0
    };

    var streakInterval = 0;

    var i;
    for (i=0; i<lastYearArr.length; i++){
      var beers = lastYearArr[i].length;

      if (beers > 0) {
        streakInterval++;
        total += beers;
      }
      else {
        if (streakInterval > longestStreak.days) {
          longestStreak['startIndex'] = i - streakInterval;
          longestStreak['endIndex'] = i - 1;
          longestStreak['days'] = streakInterval;
        }
        streakInterval = 0;
      }
    }

    if (streakInterval > longestStreak.days) {
      longestStreak['startIndex'] = i - streakInterval;
      longestStreak['endIndex'] = i - 1;
      longestStreak['days'] = streakInterval;
    }

    $scope.totalContributions = total;
    $scope.longestStreak = longestStreak;


    var currentStreak = {
      'startIndex': undefined,
      'endIndex': undefined,
      'days': 0
    };

    streakInterval = 0;
    for (i=lastYearArr.length - 1; i>=0; i--){
      var beers = lastYearArr[i].length;
      if (beers > 0) {
        streakInterval++;
        currentStreak['startIndex'] = i;
        currentStreak['endIndex'] = i + streakInterval - 1;
        currentStreak['days'] = streakInterval;
      }
      else if (i === lastYearArr.length - 1){
        continue;
      }
      else {
        break;
      }
    }

    $scope.currentStreak = currentStreak;
  };

  var getMax = function(arr){
    var max = 0;
    arr.forEach(function(item){
      if (max < item.length){
        max = item.length;
      }
    });
    return max;
  };

  var getMaxDouble = function(week){
    var max = 0;
    week.forEach(function(day){
      day.forEach(function(hour){
        if (max < hour.length){
          max = hour.length;
        }
      });
    });
    return max;
  };


  $scope.dayHours = [];
  $scope.hours = [];
  $scope.days = [];
  $scope.months = [];

  for (var dh=0; dh<24;dh++){
    $scope.dayHours.push(dh);
  }

  for (var h=0; h<24;h++){
    $scope.hours.push(h);
  }

  for (var d=0; d<7;d++){
    $scope.days.push(d);
  }

  for (var m=0; m<12;m++){
    $scope.months.push(m);
  }

  $scope.strings = {
    "DAY": {
      "0": "Sunday",
      "1": "Monday",
      "2": "Tuesday",
      "3": "Wednesday",
      "4": "Thursday",
      "5": "Friday",
      "6": "Saturday"
    },
    "MONTH": {
      "0": "January",
      "1": "February",
      "2": "March",
      "3": "April",
      "4": "May",
      "5": "June",
      "6": "July",
      "7": "August",
      "8": "September",
      "9": "October",
      "10": "November",
      "11": "December"
    },
    "SHORTDAY": {
      "0": "Sun",
      "1": "Mon",
      "2": "Tue",
      "3": "Wed",
      "4": "Thu",
      "5": "Fri",
      "6": "Sat"
    },
    "SHORTMONTH": {
      "0": "Jan",
      "1": "Feb",
      "2": "Mar",
      "3": "Apr",
      "4": "May",
      "5": "Jun",
      "6": "Jul",
      "7": "Aug",
      "8": "Sep",
      "9": "Oct",
      "10": "Nov",
      "11": "Dec"
    }
  };

  $scope.getContributionClass = function(contributions, max){
    if (contributions === 0) {
      return 'contributions-none';
    }
    else if (contributions / max <= 0.25) {
      return 'contributions-low';
    }
    else if (contributions / max <= 0.50) {
      return 'contributions-medium';
    }
    else if (contributions / max <= 0.75) {
      return 'contributions-high';
    }
    else if (contributions / max <= 1.00) {
      return 'contributions-most';
    }
  };

  $scope.getContributionPosition = function(day, week){
    var style = {
      'top': day * 15 + 'px',
      'left': 80 + Math.floor(week) * 15 + 'px'
    };
    return style;
  };

  $scope.getContributionDayClass = function(day){
    return 'contributions-day-' + day;
  };

  $scope.getContributionWeekClass = function(week){
    return 'contributions-week-' + Math.floor(week);
  };

  $scope.getContributionDate = function(index, lastYearArr){
    var diffdays = lastYearArr.length - index - 1;
    var now = new Date();
    var contributionDate = new Date();
    contributionDate.setDate(now.getDate() - diffdays);
    contributionDate.setHours(0,0,0);
    return contributionDate;
  };

  $scope.getTooltip = function(contributions, contributionDate){
    var html = '';
    if (contributions === 0) {
      html += '<strong>No contributions</strong>';
    }
    else if (contributions === 1) {
      html += '<strong>' + contributions + ' contribution</strong>';
    }
    else if (contributions > 1) {
      html += '<strong>' + contributions + ' contributions</strong>';
    }

    if (contributionDate) {
      html += ' on ' + $filter('date')(contributionDate, 'longDate');
    }

    return html;
  };

  var getDayBeerCount = function(beers){
    var dayBeers = {};
    beers.forEach(function(beer){
      if (dayBeers[beer.message] > 0) {
        dayBeers[beer.message]++
      }
      else {
        dayBeers[beer.message] = 1;
      }
    });
    return dayBeers;
  };

  var getDayBeerArray = function(beerCount){
    var beers = [];
    if (beerCount) {
      Object.keys(beerCount).forEach(function(beer){
        var beer = {
          'name': beer,
          'count': beerCount[beer]
        };
        beers.push(beer);
      });
    }
    return beers;
  };

  $scope.browseBeers = function(beers, date){
    $scope.contributionBeers = getDayBeerArray(getDayBeerCount(beers));
    $scope.period.date = date;
    $scope.period.name = undefined;
  };

  $scope.getTotalBeers = function(beers){
    var total = 0;
    for (var i=0; beers && i<beers.length; i++){
      total += beers[i].count;
    }
    return total;
  };

  $scope.changePeriod = function(period) {
    $scope.period.date = undefined;
    $scope.period.name = period;
    $scope.contributionBeers = getDayBeerArray($scope.analytics[period]);
  };

});