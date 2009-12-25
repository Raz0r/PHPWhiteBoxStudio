<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Presets {
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
		$records = $this->db->select('SELECT id,name FROM presets ORDER BY id');
		return $records;
	}
	
	/**
     * @remotable
     */
	public function create($name){
		$result = $this->db->query("INSERT INTO presets (name) VALUES (?)", $name);		
		return $result;
	}
	
		/**
     * @remotable
     */
	public function destroy($id){
		$result = $this->db->query("DELETE t1.*, t2.*, t3.* FROM (presets t1 LEFT JOIN scanitems t2 ON t1.id = t2.parentid) LEFT JOIN scantokens t3 ON t2.id = t3.parentid WHERE t1.id = ?d", $id);
		return $result;
	}

}