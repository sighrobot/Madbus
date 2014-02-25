angular.module('madbusFilters', []).filter('accessible', function() {
  return function(input) {
    return input ? 'Yes' : 'No';
  }
}).filter('accessibleES', function() {
  return function(input) {
    return input ? 'S\xED' : 'No';
  }
}).filter('directionES', function() {
  return function(input) {
  	if (input === 'eastbound') return 'Este';
  	else if (input === 'northbound') return 'Norte';
  	else if (input === 'southbound') return 'Sur';
  	else if (input === 'westbound') return 'Oeste';
  	else return '';
  }
});

