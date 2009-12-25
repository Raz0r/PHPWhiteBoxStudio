<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Projects {
	private $db;

	public function __construct() {
		global $db;

		$this->db = $db;
	}
	
	/**
	 * @remotable
	 */
	public function read($id, $cat){
		$out = array();
		if($cat == "projects") {
			$projects = $this->db->select("SELECT id, name, dir, date FROM projects ORDER BY date DESC");
			foreach($projects as $item) {
				$children = array();
				$text = "<b>Date</b>: {$item['date']}<br>";	
				$text.= "<b>Dir/File</b>: {$item['dir']}<br>";
				if(is_dir($item['dir'])) {
					array_push($children, array('id' => $item['dir'], 'text' => 'Work Directory', 'cat' => 'dir', 'qtip' => $item['dir'], iconCls => 'work-dir', 'leaf' => false));					
				} elseif(is_file($item['dir'])) {
					array_push($children, array('id' => $item['dir'], 'text' => basename($item['dir']), 'hash' => md5($item['dir']), 'iconCls' => 'php-file', 'leaf' => true));
				}
				array_push($children, array('id' => 'scans' . $item['id'], 'text' => 'Scannings', 'cat' => 'scans', 'iconCls' => 'scannings', 'leaf' => false));
				array_push($children, array('id' => 'vulns' . $item['id'], 'text' => 'Vulnerabilities', 'cat' => 'vulns', 'iconCls' => 'vulns', 'leaf' => false));
				array_push($out, array(
					'id'       => $item['id'],
					'text'     => $item['name'],
					'iconCls'  => 'project',
					'cat'      => 'project',
					'qtipCfg'  => array('shadow' => 'frame','text' => $text, 'dismissDelay' => 10000),
					'leaf'     => false,
					'children' => $children
				));
			}					
		} elseif($cat == "dir") {
			include 'Files.php';
			$f = new Files;
			$out = $f->getList($id);
		} elseif($cat == "scans") {
			include 'ScanHistory.php';
			$s = new ScanHistory;
			$out = $s->read(substr($id, 5));
		} elseif($cat == "vulns") {
			include 'Vulnerabilities.php';
			$v = new Vulnerabilities;
			$out = $v->read(substr($id, 5));
		}
		
		return $out;
	}
	
	/**
	 * @remotable
	 */
	public function create($name, $dir){		
		return $this->db->query("INSERT INTO projects (`name`, `dir`, `date`) VALUES (?, ?, NOW())", $name, $dir);
	}
	
	/**
	 * @remotable
	 */
	public function destroy($id){		
		if(!is_array($id)) $id = array($id);
		return $this->db->query("DELETE t1.*, t2.*, t3.* FROM (projects t1 LEFT JOIN scans t2 ON t1.id = t2.parentid) LEFT JOIN scanresults t3 ON t2.id = t3.parentid WHERE t1.id IN(?a)", $id);
	}
}