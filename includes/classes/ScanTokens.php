<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class ScanTokens {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}
	
	/**
	 * @remotable
	 */
	public function read($id){
		return $this->db->select('SELECT * FROM scantokens WHERE parentid = ?d ORDER BY `index`', $id);
	}
	
	/**
	 * @remotable
	 */
	public function create($data){
		$out = array();
		if(is_object($data)) {
			$data = array($data);
		}
		foreach($data as $obj) {
			$id = $this->db->query("INSERT INTO scantokens (`parentid`, `index`, `type`, `token`, `value`, `regexp`) VALUES (?, ?, ?, ?, ?, ?)", $obj->parentid, $obj->index, $obj->type, $obj->token, $obj->value, $obj->regexp);
			if($id) {
				$obj->id = $id;
				$out[] = $obj;
			}
		}
		return $out;
	}
	
	/**
	 * @remotable
	 */
	public function update($data){
		$out = array();
		if(is_object($data)) {
			$data = array($data);
		}
		foreach($data as $obj) {
			$res = $this->db->query("UPDATE scantokens SET `index` = ?, `type` = ?, `token` = ?, `value` = ?, `regexp` = ? WHERE id = ?d", $obj->index, $obj->type, $obj->token, $obj->value, $obj->regexp, $obj->id);
			if($res) {
				$out[] = $obj;
			}
		}
		return $out;
	}
	
	/**
	 * @remotable
	 */
	public function destroy($id){
		$out = array();
		if(!is_array($id)) {
			$id = array($id);
		}
		return $this->db->query("DELETE FROM scantokens WHERE id IN(?a)", $id);
	}
}