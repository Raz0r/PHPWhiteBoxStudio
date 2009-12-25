<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class ScanItems {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}
	
	/**
     * @remotable
    */
	public function read($id){
		if(intval($id) == 0) return;
		$out = array();
		$items = $this->db->select('SELECT * FROM scanitems WHERE parentid = ?', $id);
		$children = array();
		foreach($items as $item) {
			$arr = array(
				'id' => $item['id'],
				'text' => $item['name'],
				'leaf' => true,
				'iconCls' => 'scanitem'
			);
			$title = $text = "";
			list($title,$text) = explode("\n",$item['description'], 2);
			if(empty($title)) {
				$title = $item['name'];
			}
			if (empty($text)) {
				$text = '';
			}
			$arr['qtipCfg'] = array('shadow' => 'frame','text' => $text, 'title' => $title, 'dismissDelay' => 10000);
			array_push($out, $arr);
		}
		return $out;
	}
	
	/**
    * @remotable
    */
	public function destroy($id){
		if(!is_array($id)) $id = array($id);
		return $this->db->query("DELETE t1.*, t2.* FROM scanitems t1 LEFT JOIN scantokens t2 ON t1.id = t2.parentid WHERE t1.id IN(?a)", $id);
	}
	
	/**
     * @remotable
     * @formHandler
    */
	public function submit($data){
		$out = array();
		if($data['action'] == 'add') {
			$out['msg'] = $this->db->query("INSERT INTO scanitems (`parentid`, `name`, `description`) VALUES (?, ?, ?)", $data['id'], $data['name'], $data['description']);
			if($out['msg']) {
				$out['success'] = true;
			} else {
				$out['success'] = false;
			}
		} elseif($data['action'] == 'edit') {
			$out['success'] = $this->db->query("UPDATE scanitems SET `name` = ?, `description` = ? WHERE id = ?d", $data['name'], $data['description'], $data['id']);
		}
		return $out;
	}
}