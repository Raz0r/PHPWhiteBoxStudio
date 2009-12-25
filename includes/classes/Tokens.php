<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Tokens {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}
	
	/**
     * @remotable
    */
	public function read($data){
		$out = array();
		$records = $this->db->select('SELECT id, name, syntax, reference FROM tokens {WHERE name LIKE ?} ORDER BY id', "{$data->query}%");
		foreach($records as $record) {
			$data = array(
				'id' => $record['id'],
				'token' => $record['name'],
				'qtip' => ''
			);
			if(!empty($record['syntax'])) {
				$data['qtip'] = "<b>Syntax</b>: <pre>" . htmlspecialchars($record['syntax']) . "</pre>";
				if(!empty($record['reference'])) {
					$data['qtip'] .= "<i>".htmlspecialchars(strip_tags($record['reference']))."</i>";
				}
			}
			$data['qtip'] = $data['qtip'];
			array_push($out, $data);
		}
		return $out;
	}
}