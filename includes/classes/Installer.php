<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Installer {
	private $db;

	function __construct() {
		global $db;

		$this->db = $db;
	}

	/**
	 * @remotable
	 */
	public function checkRequirements(){
		$out = array();

		$version = phpversion();
		array_push($out, array(
			'item'   => 'PHP Version',
			'need'   => '>= 5.2.2',
			'actual' => $version,
			'status' => version_compare(phpversion(), '5.2.2', '>=') ? 'ok' : 'warn'
		));

		$safemode = ini_get('safe_mode');
		array_push($out, array(
			'item'   => 'Safe Mode',
			'need'   => 'Off',
			'actual' => $safemode ? 'On' : 'Off',
			'status' => $safemode ? 'fail' : 'ok'
		));

		$procopen = function_exists('proc_open');
		array_push($out, array(
			'item'   => 'proc_open()',
			'need'   => 'Enabled',
			'actual' => $procopen ? 'Enabled' : 'Disabled',
			'status' => $procopen ? 'ok' : 'fail'
		));
		
		$timelimit = function_exists('set_time_limit');
		array_push($out, array(
			'item'   => 'set_time_limit()',
			'need'   => 'Enabled',
			'actual' => $timelimit ? 'Enabled' : 'Disabled',
			'status' => $timelimit ? 'ok' : 'fail'
		));

		$cache = is_writeable('cache');
		array_push($out, array(
			'item'   => 'Directory cache is writeable',
			'need'   => 'Yes',
			'actual' => $cache ? 'Yes' : 'No',
			'status' => $cache ? 'ok' : 'fail'
		));

		$config = is_writeable('includes/config.php');
		array_push($out, array(
			'item'   => 'config.php is writeable',
			'need'   => 'Yes',
			'actual' => $config ? 'Yes' : 'No',
			'status' => $config ? 'ok' : 'fail'
		));

		return $out;
	}

	/**
     * @remotable
    */
	public function loadSettings(){
		$phppath = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') ? 'C:/xampp/php/php.exe' : '/usr/bin/php';
		$docroot = $_SERVER['DOCUMENT_ROOT'];
		$chars = strrev($_SERVER['DOCUMENT_ROOT']);
		if($chars{0} == '/') {
			$docroot = substr($docroot, 0, strlen($docroot) - 1);
		}
		return array(
			'success' => true, 
			'data' => array(
				'host'     => 'localhost', 
				'username' => 'root', 
				'database' => 'phpwbstudio', 
				'docroot'  => $docroot, 
				'createdb' => true, 
				'phppath'  => $phppath,
				'phpext'   => array('php', 'php3', 'php4', 'php5', 'phtml')
		));
	}

	/**
     * @remotable
     * @formHandler
    */
	public function submitSettings($data){

		$out = array();
		$out['success'] = false;
		$s = mysql_connect($data['host'], $data['username'], $data['password']);
		if(!$s) {
			$out['msg'] = 'Unable to connect to MySQL Database';
			return $out;
		}
		$s = mysql_select_db($data['database']);
		if(!$s) {
			if($data['createdb']) {
				$r = mysql_query("CREATE DATABASE IF NOT EXISTS {$data['database']}");
				if(!$r) {
					$out['msg'] = "Unable to create database {$data['database']}";
					return $out;
				} else {
					mysql_select_db($data['database']);
				}
			} else {
				$out['msg'] = "Database {$data['database']} does not exist";
				return $out;
			}
		}

		$s = is_dir($data['docroot']) && is_readable($data['docroot']);
		if(!$s) {
			$out['msg'] = "Document root is invalid";
			return $out;
		}

		$s = is_executable($data['phppath']);
		if(!$s) {
			$out['msg'] = "PHP executable path is invalid";
			return $out;
		}

		$sql = file('sql/install.sql');
		foreach($sql as $s) {
			$r = mysql_query($s);
			if(!$r) {
				$out['msg'] = "Unable to execute a SQL query<br><pre>".mysql_error()."</pre>";
				return $out;
			}
		}

		$dirroot = str_replace('\\','/',realpath(dirname(__FILE__) . '/../../'));
		$version = VERSION;

		$data = array_map('addslashes', $data);

		$contents = <<<CONFIG
<?php

/**
 * Database
 *
 */ 
define('SYS_DSN', 'mysql://{$data['username']}:{$data['password']}@{$data['host']}/{$data['database']}');

/**
 * Paths
 *
 */
define('DOC_ROOT', '{$data['docroot']}');
define('DIR_ROOT', '$dirroot');
define('SYS_PHP_PATH', '{$data['phppath']}');

/**
 * App
 *
 */
define('VERSION', '$version');
define('INSTALLED', true);

/**
 * Misc
 *
 */
define('SYS_PHP_EXT', '{$data['phpext']}');
CONFIG;


		$s = file_put_contents('includes/config.php', $contents);
		if(!$s) {
			$out['msg'] = "Unable to write the config file";
			return $out;
		}

		$out['success'] = true;
		$out['msg'] = "Success";

		return $out;
	}

}