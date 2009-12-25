<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Home {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}

	/**
	 * @remotable
	 */
	public function getData(){
		return $this->db->select('SELECT "Projects" AS name, COUNT(*) AS value FROM projects UNION SELECT "Scannings" AS name, COUNT(*) AS value FROM scans UNION SELECT "Presets" AS name, COUNT(*) AS value FROM presets UNION SELECT "Scan Items" AS name, COUNT(*) AS value FROM scanitems WHERE parentid <> 0 UNION SELECT "Items Marked Vulnerable" AS name, COUNT(*) AS value FROM scanresults WHERE vulnerable = 1');
	}

	/**
	 * @remotable
	 */
	public function getVersion($version){
		$d = "version=" . urlencode($version);
		$p = "POST /checkVersion.php HTTP/1.0\r\n";
		$p.= "Host: raz0r.name\r\n";
		$p.= "Content-Type: application/x-www-form-urlencoded\r\n";
		$p.= "Content-Length: ".strlen($d)."\r\n";
		$p.= "Connection: close\r\n\r\n";
		$p.= $d;
		$s = fsockopen('raz0r.name', 80);
		if($s){
			fputs($s, $p);
			$resp = '';
			while(!feof($s)) $resp .= fgets($s);
			$resp = explode("\r\n\r\n", $resp);
			return $resp[1];
		}
		return false;
	}

}