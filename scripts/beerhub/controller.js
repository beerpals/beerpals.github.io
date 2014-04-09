'use strict';

angular.module('beerApp').
controller('BeerCtrl', function ($scope, $http, $routeParams) {

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
    'lastYearArr': lastYearArr
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
        oneYearAgo.setYear(now.getFullYear() - 1);
        oneYearAgo.setHours(0,0,0);
        $scope.firstDay = oneYearAgo.getDay();

        var index = Math.floor((date - oneYearAgo) / (24 * 60 * 60 * 1000));

        $scope.analytics['lastYearArr'][index].push(c);
        $scope.commits.push(c);
      }
    });

    $scope.maxLastYear = getMax($scope.analytics.lastYearArr);
    $scope.maxYear = getMax($scope.analytics.yearArr);
    $scope.maxWeek = getMax($scope.analytics.weekArr);
    $scope.maxDay = getMax($scope.analytics.dayArr);
    $scope.maxWeekHours = getMaxDouble($scope.analytics.weekhoursArr);

    getStreaks($scope.analytics.lastYearArr);
    
  });

  var getStreaks = function(lastYearArr){
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
      longestStreak['endIndex'] = i;
      longestStreak['days'] = streakInterval;
    }

    $scope.longestStreak = longestStreak;
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
      'left': Math.floor(week) * 15 + 'px'
    };
    return style;
  };

  $scope.getContributionDate = function(index, lastYearArr){
    var diffdays = lastYearArr.length - index - 1;
    var now = new Date();
    var contributionDate = new Date();
    contributionDate.setDate(now.getDate() - diffdays);
    contributionDate.setHours(0,0,0);
    return contributionDate;
  };

});