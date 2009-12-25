<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

class Files {

	/**
     * @remotable
     */
	public function getList($dir){
		$struct = array();
		$exts = explode(',', SYS_PHP_EXT);
		if($dir == "root") {
			return array(array('id' => DOC_ROOT, 'text' => DOC_ROOT, 'leaf' => false));
		}
		if (is_dir($dir)) {
			if ($dh = opendir($dir)) {
				while (($item = readdir($dh)) !== false) {
					if(in_array($item, array(".", ".."))) continue;
					$path = "$dir/$item";
					if(is_dir($path)) {
						array_push($struct, array(
						'id' => $path,
						'text' => $item,
						'cat' => 'dir',
						'leaf' => false
						));
					} else {
						$arr = array(
						'id' => $path,
						'hash' => md5($path),
						'text' => $item,
						'leaf' => true
						);
						if(in_array(substr($item, strrpos($item, ".") + 1), $exts)) {
							$arr['iconCls'] = 'php-file';
						} else {
							$arr['iconCls'] = 'file';
						}
						array_push($struct, $arr);
					}
				}
				closedir($dh);
			}
			$this->sort(&$struct);
			return $struct;
		}
		throw new Exception("Invalid path specified");
	}

	/**
     * @remotable
     */
	public function getContents($path) {
		if(file_exists($path)) {
			$contents = file_get_contents($path);
			$encoding = $this->detect_encoding($contents);
			if($encoding == 'windows-1251') {
				$contents = iconv("windows-1251", "UTF-8", $contents);
			}
			return array('contents' => $contents, 'encoding' => $encoding);
		} else {
			throw new Exception("Invalid path specified");
		}
	}

	/**
     * @remotable
     */
	public function saveContents($path, $contents, $encoding) {
		if(file_exists($path)) {
			$contents = iconv("UTF-8", $encoding, $contents);
			return file_put_contents($path, $contents);
		} else {
			throw new Exception("Invalid path specified");
		}
	}

	private function sort(&$array) {
		$files = array();
		foreach ($array as $k => $file) {
			if($file['leaf'] == true) {
				$files[] = $array[$k];
				unset($array[$k]);
			}
		}
		usort($array,  array($this, 'cmp'));
		usort($files,  array($this, 'cmp'));
		$array = array_merge($array, $files);
	}

	private function cmp($a, $b) {
		return strcmp($a["text"], $b["text"]);
	}

	private function detect_encoding($string) {
		static $list = array('utf-8', 'windows-1251');
		foreach ($list as $item) {
			$sample = iconv($item, $item, $string);
			if (md5($sample) == md5($string))
			return $item;
		}
		return null;
	}
}