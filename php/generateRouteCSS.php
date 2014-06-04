<?php
require_once 'Requests.php';
Requests::register_autoloader();

$css_file_name = '../css/route_colors.css';
$css_file_string = "/* Bus route color sheet */\n\n"; // stylesheet string
$key = 'AIzaSyAEVwn-sjJfe0wkCM0z7abz-o9C889rag8';
$routes_table_key = '1Ng-Qt5AzM9BXP_PqgO7APw1wTjWuBaj86BWxFRQ';

// get list of all routes
$all_routes_url = 'https://www.googleapis.com/fusiontables/v1/query' . 
    '?sql=' . 'SELECT * ' .
              'FROM ' . $routes_table_key . 
    '&key=' . $key;
$response = json_decode(Requests::get($all_routes_url, 
    $options = array('timeout' => 50))->body);

foreach ($response->rows as $route) {
    // Query Google Fusion for text and background color of each route
    $routeID = $route[2];
    $query = 'SELECT "route_color", "route_text_color"' .
            ' FROM ' . $routes_table_key .
            ' WHERE "route_short_name" = "' . $routeID . '"';

    $url = 'https://www.googleapis.com/fusiontables/v1/query' .
            '?sql=' . $query .
            '&key=' . $key;

    echo $url . "\n";

    $color_data = json_decode(Requests::get($url, $options = array('timeout' => 20))->body);

    if (array_key_exists('rows', $color_data)) {
        $background_color = $color_data->rows[0][0];
        $color = $color_data->rows[0][1];
        $css = ".route-" . $routeID . " { background-color: #" . $background_color . ";" .
            " color: #" . $color . "; }";
    }

    else {
        // Blank line for queries with empty rows
        echo '***' . $url;
        $css = "";
    }

    $css_file_string .= $css . "\n";
}

if(!$css_file_handle = fopen($css_file_name, 'w')) {
    echo "Cannot open file ($css_file_name)";
    die();
}

// write CSS data to stylesheet
if(fwrite($css_file_handle, $css_file_string) === FALSE) {
    echo "Cannot write to file ($css_file_name)";
    die();
}

?>
