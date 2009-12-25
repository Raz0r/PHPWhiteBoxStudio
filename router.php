<?php
@session_start();

require_once('includes/config.php');
require_once('includes/ExtDirect/API.php');
require_once('includes/ExtDirect/Router.php');
require_once('includes/DbSimple/Generic.php');

if(get_magic_quotes_gpc()) {
	$_POST   = array_map('stripslashes', $_POST);
	$_COOKIE = array_map('stripslashes', $_COOKIE);
}

if(INSTALLED) {
	$db = DbSimple_Generic::connect(SYS_DSN);
}

// this should alwasy be set but if its not, then execute api.php without outputting it
if(!isset($_SESSION['ext-direct-state'])) {
    ob_start();
    include('api.php');
    ob_end_clean();
}

$api = new ExtDirect_API();
$api->setState($_SESSION['ext-direct-state']);
  
$router = new ExtDirect_Router($api);
$router->dispatch();
$router->getResponse(true); // true to print the response instantly