<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Vulnerabilities {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}

	public function read($id) {
		$out = array();
		$vulns = $this->db->select("SELECT t1.id, t1.file, t1.line, t1.code, t1.item FROM scanresults t1 LEFT JOIN scans t2 ON t1.parentid = t2.id WHERE t1.vulnerable = 1 AND t2.parentid = ?d ORDER BY t1.id ", $id);
		foreach($vulns as $vuln) {
			$file = basename($vuln['file']);
			$code = str_replace(array("\r","\n"), " ", $vuln['code']);
			$code = str_replace("\t", "", $code);
			$code = htmlspecialchars(substr($code, 0, 38));
			$text = "<b>$file@{$vuln['line']}</b><pre>$code...</pre>";
			array_push($out, array(
				'id'      => 'vuln'.$vuln['id'],
				'text'    => "{$vuln['item']}",
				'leaf'    => true,
				'iconCls' => 'bug',
				'file'    => $vuln['file'],
				'cat'     => 'vuln',
				'hash'    => md5($vuln['file']),
				'line'    => $vuln['line'],
				'code'    => $vuln['code'],
				'qtipCfg' => array('shadow' => 'frame','text' => $text, 'dismissDelay' => 10000)
			));
		}
		return $out;
	}
	
	/**
	 * @remotable
	 */
	public function destroy($id){		
		if(!is_array($id)) $id = array($id);
		return $this->db->query("UPDATE scanresults SET vulnerable = 0 WHERE id IN(?a)", $id);
	}
}