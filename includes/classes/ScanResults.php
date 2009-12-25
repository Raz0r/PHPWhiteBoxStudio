<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class ScanResults {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}
	
	/**
     * @remotable
     */
	public function read($id, $lastid){
		global $db;
		$out = array();
		$status = $this->db->selectCell('SELECT status FROM scans WHERE id = ?d', $id);
		$records = $this->db->select('SELECT id, file, MD5(file) AS hash, item, line, code, vulnerable, reviewed FROM scanresults WHERE parentid = ?d AND id > ?d', $id, $lastid);
		$out['records'] = $records;
		$out['status'] = $status;
		return $out;
	}

	/**
     * @remotable
     */
	public function create($name){
		return true;
	}

	/**
     * @remotable
     */
	public function destroy($id){
		$result = $this->db->query("DELETE t1.*, t2.*, t3.* FROM (presets t1 LEFT JOIN scanitems t2 ON t1.id = t2.parentid) LEFT JOIN scantokens t3 ON t2.id = t3.parentid WHERE t1.id = ?d", $id);
		return $result;
	}

	/**
     * @remotable
     */
	public function update($data){		
		$out = array();
		if(!is_array($data)) {
			$data = array($data);
		}
		foreach($data as $item) {
			if(isset($item->vulnerable)) {
				$result = $this->db->query("UPDATE scanresults SET vulnerable = ?d WHERE id = ?d", $item->vulnerable, $item->id);
			} elseif(isset($item->reviewed)) {
				$result = $this->db->query("UPDATE scanresults SET reviewed = ?d WHERE id = ?d", $item->reviewed, $item->id);
			}
			if($result !== false) {
				$out[] = true;
			}
		}

		return $out;
	}

	/**
     * @remotable
     */
	public function getStatus($id) {
		return $this->db->selectCell('SELECT status FROM scans WHERE id = ?d', $id);
	}

}