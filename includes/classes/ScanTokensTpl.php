<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class ScanTokensTpl {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}
	
	/**
	 * @remotable
	 */
	public function read(){
		$out = array();
		$records = $this->db->select('SELECT `id`, `name` FROM scanitems WHERE parentid=0');
		foreach($records as $record) {
			$tokens = $this->db->select("SELECT `id`, `type`, `token`, `value`, `regexp` FROM scantokens WHERE `parentid` = ? ORDER BY `index`", $record['id']);
			array_push($out, array('id' => $record['id'], 'name' => $record['name'], 'tokens' => $tokens));
		}
		return $out;
	}
}