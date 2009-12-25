<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Scan {
	private $db;
	private $windows;

	public function __construct() {
		global $db;

		$this->db = $db;
		$this->windows = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN');
	}

	/**
     * @remotable
     */
	public function start($projectid, $presetid){
		$id = $this->db->query('INSERT INTO scans (`parentid`, `date`, `presetid`, `presetname`) VALUES (?d, NOW(), ?d, (SELECT name FROM presets WHERE id = ?d))', $projectid, $presetid, $presetid);
		if($this->windows) {
			$cmd = 'start /b ' . SYS_PHP_PATH . ' -C ' . DIR_ROOT . '/scripts/scan.php ' . $id;
		} else {
			$cmd = SYS_PHP_PATH . ' -C ' . DIR_ROOT . '/scripts/scan.php ' . $id . ' &';
		}
		$h = popen($cmd, 'r');

		if($h === false) {
			$this->db->query('DELETE FROM scans WHERE id = ?d', $id);
			return false;
		}
		return $id;
	}

	/**
     * @remotable
     */
	public function stop($id) {
		$rec = $this->db->selectRow('SELECT pid, status FROM scans WHERE id = ?d LIMIT 1', $id);
		$pid = $rec['pid'];
		$status = $rec['status'];
		if($status == 'Finished') {
			return true;
		}
		if($this->windows) {
			$h = popen("cmd /U /c taskkill /f /PID $pid", 'r');
		} else {
			$h = popen("kill -9 $pid", 'r');
		}
		if($h === false) {
			return false;
		} else {
			$r = '';
			while(!feof($h)) {
				$r .= fgets($h);
			}
		}
		if($this->windows) {
			$h = popen('cmd /U /c chcp 65001 > nul && tasklist /FO CSV', 'r');
			while(!feof($h)) {
				$data[]= fgetcsv($h);
			}
			pclose($h);

			foreach($data as $proc) {
				if(isset($proc[1]) && $proc[1] == $pid) {
					return false;
				}
			}
		} else {
			$data = '';
			$h = popen("ps -p $pid | wc -l", 'r');
			while(!feof($h)) {
				$data .= fgets($h);
			}
			if($data == 2) {
				return false;
			}
		}
		return $this->db->query("UPDATE scans SET status = 'Stopped' WHERE id = ?d LIMIT 1", $id);
	}
}