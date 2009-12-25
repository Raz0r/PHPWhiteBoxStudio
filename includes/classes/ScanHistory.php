<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class ScanHistory {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}

	public function read($id) {
		$out = array();
		$scans = $this->db->select("SELECT t1.id, t1.date, t1.status, t1.presetid, t1.presetname, COUNT(t2.id) AS resultitems, SUM(t2.vulnerable) AS vulnerable, SUM(t2.reviewed) AS reviewed FROM scans t1 LEFT JOIN scanresults t2 ON t2.parentid = t1.id WHERE t1.parentid = ?d GROUP BY t1.date ORDER BY t1.id DESC", $id);
		foreach($scans as $scan) {
			$text = "<b>Date</b>: {$scan['date']}<br>";
			$text.= "<b>Preset</b>: {$scan['presetname']}<br>";
			$text.= "<b>Status</b>: {$scan['status']}<br>";
			$text.= "<b>Reviewed</b>: {$scan['reviewed']}/{$scan['resultitems']}<br>";
			$text.= "<b>Vulnerable</b>: {$scan['vulnerable']}<br>";
			switch($scan['status']) {
				case 'Started':
					$icon = 'scan-started';
					break;
				case 'Stopped':
					$icon = 'scan-stopped';
					break;
				case 'Finished':
					$icon = 'scan-finished';
					break;
				default: 
					$icon = 'scan';
					break;
			}
			array_push($out, array(
				'id'         => 'scan'.$scan['id'],
				'text'       => "{$scan['presetname']} ({$scan['resultitems']})",
				'preset'     => $scan['presetid'],
				'presetName' => $scan['presetname'],
				'leaf'       => true,
				'iconCls'    => $icon,
				'cat'        => 'scan',
				'qtipCfg'    => array('shadow' => 'frame','text' => $text, 'dismissDelay' => 10000)
			));
		}
		return $out;
	}
	
	/**
	 * @remotable
	 */
	public function destroy($id){		
		if(!is_array($id)) $id = array($id);
		return $this->db->query("DELETE t1.*, t2.* FROM scans t1 LEFT JOIN scanresults t2 ON t1.id = t2.parentid WHERE t1.id IN(?a)", $id);
	}
}