<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'Requests.php';
Requests::register_autoloader();


exec("mv json/*.json json/old/"); // Backup old files


$routesAssocArray = runAllRoutes();
runIndividualRoutesAndMasterStops($routesAssocArray);




function runAllRoutes() {
  // run logic to populate JSON file containing all routes and associated information

  $routesFileName = 'json/all_routes.json';

  try {
    $request = Requests::get('http://api.smsmybus.com/v1/getroutes?key=aber8932', $options = array('timeout' => 50));
  }
  catch (Exception $e) {
    try {
      $request = Requests::get('http://api.smsmybus.com/v1/getroutes?key=aber8932', $options = array('timeout' => 50));
    }

    catch (Exception $e) {
      echo "Failure connecting to API for list of all routes. Script terminated.\n";
      die();
    }
  }

  $routesAssocArray = json_decode($request->body); // convert JSON response to assoc array

  foreach ($routesAssocArray->routes as $route) {
    convertRoute($route);
  }

  $allRoutesJSON = json_encode($routesAssocArray);
  writeMasterRoutes($routesFileName, $allRoutesJSON);

  return $routesAssocArray;
}

function runIndividualRoutesAndMasterStops($routesAssocArray) {
  // run logic to populate individual JSON files for each route and JSON file containing every individual stop

  $masterStops = array(); // assoc array containing all stops with their associated routes
  $masterStopsFileName = "json/all_stops.json";

  foreach ($routesAssocArray->routes as $route) {
    $routeID = $route->routeID;

    try {
      $request = Requests::get("http://api.smsmybus.com/v1/getstops?key=aber8932&routeID=$routeID", $options = array('timeout' => 20));
    }
    catch (Exception $e) {
      try {
        $request = Requests::get("http://api.smsmybus.com/v1/getstops?key=aber8932&routeID=$routeID", $options = array('timeout' => 20));
      }
      catch (Exception $e) {
        echo "Failure connecting to API for route " . $routeID . ". Script terminated.\n";
        die();
      }
    }

    $routeAssocArray = json_decode($request->body);
    $routeStops = $routeAssocArray->stops;
    $routeAssocArray->stops = dedupeStops($routeStops);
    convertStops($routeAssocArray);
    $masterStops = createMasterStops($routeAssocArray, $masterStops);
    
    $routeJSON = json_encode($routeAssocArray);
    $routeFileName = "json/$routeID.json";
    writeRoute($routeFileName, $routeJSON);
  }

  // Write Master Stops

  $masterStopsJSON = json_encode($masterStops);
  writeMasterStops($masterStopsFileName, $masterStopsJSON);


}


function convertRoute($route) {
  for ($i = 0; $i < count($route->directions); $i++) {
    $direction = $route->directions[$i];
    $direction = str_replace('CapSq', 'Capitol Square', $direction);
    $direction = str_replace('Cap Sq', 'Capitol Square', $direction);
    $direction = str_replace('NTP', 'North Transfer Point', $direction);
    $direction = str_replace('STP', 'South Transfer Point', $direction);
    $direction = str_replace('ETP', 'East Transfer Point', $direction);
    $direction = str_replace('WTP', 'West Transfer Point', $direction);
    $direction = str_replace('E Towne', 'East Towne', $direction);
    $direction = str_replace('W Towne', 'West Towne', $direction);
    $direction = str_replace('P&R', 'Park & Ride', $direction);
    $direction = str_replace('Richmond H', 'Richmond Hills', $direction);
    $direction = str_replace('Rdg', 'Ridge', $direction);
    $direction = str_replace('T American Ctr', 'The American Center', $direction);
    $direction = str_replace('Am Ctr', 'The American Center', $direction);
    $direction = str_replace('City Vw', 'City View', $direction);
    $direction = str_replace(' Av', ' Ave', $direction);
    $direction = str_replace('Twn Ctr', 'Town Center', $direction);
    $direction = str_replace('Hts', 'Heights', $direction);
    $route->directions[$i] = $direction;
  }
}

function dedupeStops($routeStops) {
  $dedupedStopsAssocArray = array(); // temporarily store stops in a hash to get unique values
  $dedupedStopsArray = array(); // then push the unqiue values into a list and return it
  foreach ($routeStops as $stop) {
    $dedupedStopsAssocArray[$stop->stopID] = $stop;
  }

  foreach($dedupedStopsAssocArray as $stopID => $stop) {
    array_push($dedupedStopsArray, $stop);
  }

  return $dedupedStopsArray;
}


function convertStops($routeAssocArray) {
  foreach($routeAssocArray->stops as $stop) {
    $destination = $stop->destination;
    $destination = ucwords(strtolower($destination));
    $stop->destination = $destination;
    $intersection = $stop->intersection;
    $intersection = ucwords(strtolower($intersection));
    $intersection = str_replace('West Wash', 'W Washington', $intersection);
    $intersection = str_replace('Rr', 'RR', $intersection);
    $intersection = str_replace('M L K', 'MLK', $intersection);
    $intersection = str_replace('Ccb', 'City-County Bldg', $intersection);
    $intersection = str_replace('Univ ', 'University ', $intersection);
    $intersection = str_replace('Mc ', 'Mc', $intersection);
    $intersection = str_replace('Va Hosp', 'VA Hospital', $intersection);
    $intersection = str_replace('Ctr', 'Center', $intersection);
    $intersection = str_replace('Heather Cr', 'Heather Crest', $intersection);
    $intersection = str_replace('U Bay', 'University Bay', $intersection);
    $intersection = str_replace('Uw', 'UW', $intersection);
    $intersection = str_replace('Research Pk', 'Research Park', $intersection);
    $intersection = str_replace('East Wash', 'E Washington', $intersection);
    $intersection = str_replace('Sw Commuter', 'SW Commuter Path', $intersection);
    $intersection = str_replace('E Wash ', 'E Washington ', $intersection);
    $intersection = str_replace('E Towne Rng', 'East Towne Ring', $intersection);
    $intersection = str_replace('W Towne Rng', 'West Towne Ring', $intersection);
    $intersection = str_replace(' Ft', ' Frontage', $intersection);
    $intersection = str_replace('Mac ', 'Mac', $intersection);
    $intersection = str_replace('Madison Coll', 'Madison College', $intersection);
    $intersection = str_replace('Wps', 'WPS', $intersection);
    $intersection = str_replace('P&r', 'Park & Ride', $intersection);
    $intersection = str_replace('Cottage Gr', 'Cottage Grove', $intersection);
    $intersection = str_replace(' Hs', ' HS', $intersection);
    $intersection = str_replace('`', '\'', $intersection);
    $intersection = str_replace('Afscme', 'Associated Bank', $intersection);
    $intersection = str_replace('J Q Hammons', 'John Q Hammons', $intersection);
    $intersection = str_replace('City Center W', 'City Center W Bldg', $intersection);
    $intersection = str_replace('Twn', 'Town', $intersection);
    $intersection = str_replace(' Hts', ' Heights', $intersection);
    $intersection = str_replace(' Rg', ' Ridge', $intersection);
    $intersection = str_replace(' Rdg', ' Ridge', $intersection);
    $intersection = str_replace(' Vly', ' Valley', $intersection);
    $intersection = str_replace(' Vy', ' Valley', $intersection);
    $intersection = str_replace('Hq', 'HQ', $intersection);
    $intersection = str_replace(' Gdns', ' Gardens', $intersection);
    $intersection = str_replace(' Plz', ' Plaza', $intersection);
    $intersection = str_replace('Air Frt', 'Air Freight', $intersection);
    $intersection = str_replace('Econ Lot', 'Economy Lot', $intersection);
    $intersection = str_replace(' Vw', ' View', $intersection);
    $intersection = str_replace(' Pk', ' Park', $intersection);
    $intersection = str_replace('Herzing Univ', 'Herzing University', $intersection);
    $intersection = str_replace(' Wd', ' Wood', $intersection);
    $intersection = str_replace(' Lf', ' Leaf', $intersection);
    $intersection = str_replace('Hi Crossing', 'High Crossing', $intersection);
    $intersection = str_replace('Datcp', 'DATCP', $intersection);
    $intersection = str_replace('Sparkle Stn', 'Sparkle Stone Crescent', $intersection);
    $intersection = str_replace(' Hlw', ' Hollow', $intersection);
    $intersection = str_replace(' Rk', ' Rock', $intersection);
    $intersection = str_replace('K James', 'King James', $intersection);
    $intersection = str_replace(' Lts', ' Lights', $intersection);
    $intersection = str_replace('Maple Gr', 'Maple Grove', $intersection);
    $intersection = str_replace('Grnd', 'Grand', $intersection);
    $intersection = str_replace('Sqr', 'Square', $intersection);
    $intersection = str_replace(' Cuna', ' CUNA', $intersection);
    $intersection = str_replace('Crestwood Es', 'Crestwood Elementary', $intersection);
    $intersection = str_replace('Tfr Pt', 'TP', $intersection);
    $intersection = str_replace('South Rdg', 'Southridge', $intersection);
    $intersection = str_replace('South Ridge', 'Southridge', $intersection);
    $intersection = str_replace(' Ck', ' Creek', $intersection);
    $intersection = str_replace(' Etc', ' ETC', $intersection);
    $intersection = str_replace(' Pt', ' Point', $intersection);
    $intersection = str_replace('Am F', 'American F', $intersection);
    $stop->intersection = $intersection;
  }
} 

function createMasterStops($routeAssocArray, $masterStops) {
  foreach($routeAssocArray->stops as $stop) {

    // initialize key for stop if not set
    $stopID = $stop->stopID;
    if (!array_key_exists($stopID, $masterStops)) {
      $masterStops[$stop->stopID] = array();
    }
    
    if (!(in_array($routeAssocArray->routeID, $masterStops[$stopID]))) {
      array_push($masterStops[$stopID], $routeAssocArray->routeID);
    }
  }

  return $masterStops;
}

function writeMasterRoutes($routesFileName, $allRoutesJSON) {

  if(!$routesHandle = fopen($routesFileName, 'w')) {
    echo "Cannot open file ($routesFileName)";
    die();
  }

  if(fwrite($routesHandle, $allRoutesJSON) === FALSE) {
    echo "Cannot write to file ($routesFileName)";
    die();
  }

  fclose($routesHandle);
}

function writeRoute($routeFileName, $routeJSON) { 

  if (!$routeHandle = fopen($routeFileName, 'w')) {
    echo "Cannot open file $routeFileName";
    die();
  }

  if (fwrite($routeHandle, $routeJSON) === FALSE) {
    echo "Cannot write to file $routeFileName";
    die();
  }

  fclose($routeHandle);
}

function writeMasterStops($masterStopsFileName, $masterStopsJSON) {

  if(!$masterStopsHandle = fopen($masterStopsFileName, 'w')) {
    echo "Cannot open file ($masterStopsFileName)";
    die();
  }

  if(fwrite($masterStopsHandle, $masterStopsJSON) === FALSE) {
    echo "Cannot write to file ($routesFileName)";
    die();
  }

  fclose($masterStopsHandle);
}

?> 
