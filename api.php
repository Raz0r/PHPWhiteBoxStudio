<?php
@session_start();

require_once('includes/config.php');
require_once('includes/ExtDirect/API.php');
require_once('includes/ExtDirect/CacheProvider.php');

$cache = new ExtDirect_CacheProvider('cache/api_cache.txt');
$api = new ExtDirect_API();

$api->setRouterUrl('router.php'); // default
$api->setCacheProvider($cache);
$api->setNamespace('Ext.ss');
$api->setDescriptor('Ext.ss.APIDesc');
$api->setDefaults(array(
    'autoInclude' => true,
    'basePath' => 'includes/classes'
));

$api->add(
    array(
   		'Projects',
        'Files',
        'Presets',
        'Scan',
        'ScanHistory',
        'ScanTokens',
        'ScanItems',
        'ScanResults',
        'Vulnerabilities',
        'Tokens',
        'ScanTokensTpl',
        'Home',
        'Installer'
    )
);

$api->output();

$_SESSION['ext-direct-state'] = $api->getState();