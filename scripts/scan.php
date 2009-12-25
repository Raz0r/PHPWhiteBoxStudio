<?php

/**
 * @package    PHP White Box Studio
 * @copyright  2009 Raz0r
 * @link       http://github.com/arseny/PHPWhiteBoxStudio
 * @license    BSD License
 */

if (!defined('STDIN')) {
	die("Can be run only from CLI");
}

set_time_limit(0);

require_once('includes/DbSimple/Generic.php');
require_once('includes/config.php');

define('T_TERMINAL',       1000);
define('T_STRING_LITERAL', 1001);

define('TOKEN_OVER',      0);
define('TOKEN_JUSTAFTER', 1);

if (!defined('T_ML_COMMENT')) {
	define('T_ML_COMMENT', T_COMMENT);
} else {
	define('T_DOC_COMMENT', T_ML_COMMENT);
}

$exts = explode(',', SYS_PHP_EXT);

$db = DbSimple_Generic::connect(SYS_DSN);

$id = isset($_SERVER['argv'][1]) ? $_SERVER['argv'][1] : die("Missing required argument");

$pid = getmypid();
if($pid === false) {
	$result = $db->query("UPDATE scans SET status = 'Could not get process ID' WHERE id = ?d LIMIT 1", $id);
	die;
}

$result = $db->query("UPDATE scans SET pid = ?d, status = 'Started' WHERE id = ?d LIMIT 1", $pid, $id);

$record = $db->selectRow('SELECT t1.presetid, t2.dir AS dir FROM scans t1 LEFT JOIN projects t2 ON t1.parentid = t2.id WHERE t1.id = ?d LIMIT 1', $id);

$dir = $record['dir'];

$scanItems = $db->select('SELECT id, name FROM scanitems WHERE parentid = ?d', $record['presetid']);

$aScanItems = array();
foreach($scanItems as $scanItem) {
	$scanTokens = $db->select('SELECT type, token, value, `regexp` FROM scantokens WHERE parentid = ?d ORDER BY `index`', $scanItem['id']);
	$aScanTokens = array();
	foreach($scanTokens as $scanToken) {
		$tokenCode  = constant($scanToken['token']);
		$tokenValue = $scanToken['value'];
		$tokenType  = $scanToken['type'];
		$tokenRe    = $scanToken['regexp'];
		array_push($aScanTokens, array($tokenCode, $tokenValue, $tokenType, $tokenRe));
	}
	reset($aScanTokens);
	array_push($aScanItems, array('id' => $scanItem['id'], 'name' => $scanItem['name'], 'scanTokens' => $aScanTokens));
}

scan($dir);

$result = $db->query("UPDATE scans SET status = 'Finished' WHERE id = ?d LIMIT 1", $id);

function scan($path) {
	global $aScanItems, $db, $id, $exts;

	if (is_dir($path)) {
		if ($dh = opendir($path)) {
			while (($item = readdir($dh)) !== false) {
				if(in_array($item, array(".", ".."))) continue;
				$newPath = "$path/$item";
				scan($newPath);
			}
			closedir($dh);
		}
	} else {
		if(!in_array(substr($path, strrpos($path, ".") + 1), $exts)) {
			return;
		}
		$code = $line = array();
		$source = file_get_contents($path);
		$tokens = token_get_all($source);
		$oTokens = new Tokens;
		$totalItems = count($aScanItems);

		while(($token = array_shift($tokens))) {
			for($i = 0; $i < $totalItems; $i++) {
				$itemId   = $aScanItems[$i]['id'];
				$itemName = $aScanItems[$i]['name'];
				$totalTokens = count($aScanItems[$i]['scanTokens']);

				if($oTokens->compareValues($aScanItems[$i]['scanTokens'][0], $token) && !(key($aScanItems[$i]['scanTokens']) == $totalTokens-1)) {
					reset($aScanItems[$i]['scanTokens']);
					unset($code[$itemId], $line[$itemId]);
				}

				$aToken = current($aScanItems[$i]['scanTokens']);

				if(isset($code[$itemId])) {
					$t = $oTokens->parseToken($token);
					$code[$itemId] .=  $t['value'];
				}
				$result = $oTokens->compareValues($aToken, $token);
				if($result) {
					if(!isset($line[$itemId]) && isset($token[2])) {
						$line[$itemId] = $token[2];
					}
					if(!isset($code[$itemId])) {
						$t = $oTokens->parseToken($token);
						$code[$itemId] = $t['value'];
					}
					if(key($aScanItems[$i]['scanTokens']) == $totalTokens-1) {
						if(!isset($line[$itemId])) {
							if(!isset($offset)) {
								$offset = 0;
							}
							$pos = strpos($source, $code[$itemId], $offset);
							$line[$itemId] = substr_count($source, "\n", null, $pos) + 1;
							$offset = $pos + strlen($code[$itemId]);
						}

						$db->query('INSERT INTO scanresults (parentid, file, item, line, code) VALUES(?d, ?, ?, ?d, ?)', $id, $path, $itemName, $line[$itemId], $code[$itemId]);
						reset($aScanItems[$i]['scanTokens']);
						unset($code[$itemId], $line[$itemId]);
						continue;
					}
					next($aScanItems[$i]['scanTokens']);
				} else {
					if($oTokens->compareValues($aScanItems[$i]['scanTokens'][$totalTokens-1], $token)) {
						reset($aScanItems[$i]['scanTokens']);
						unset($code[$itemId], $line[$itemId]);
					}
					if($aToken[2] == TOKEN_JUSTAFTER && !$oTokens->compareCodes($token, T_TERMINAL)) {
						reset($aScanItems[$i]['scanTokens']);
						unset($code[$itemId], $line[$itemId]);
					}
				}
			}
		}
	}
}

class Tokens {

	public function __construct() {

	}

	public function compareValues($firstToken, $secondToken) {
		$first  = $this->parseToken($firstToken);
		$second = $this->parseToken($secondToken);
		if($first['code'] == $second['code']) {
			if($firstToken[3]) {
				if(preg_match("@{$first['value']}@msi", $second['value'])) {
					return true;
				}
			} else {
				if(strcasecmp($first['value'], $second['value']) == 0) {
					return true;
				}
			}
		}
		return false;
	}

	public function compareCodes($firstToken, $tokenCode) {
		$first = $this->parseToken($firstToken);
		if(is_array($tokenCode)) {
			if(in_array($first['code'], $tokenCode)) {
				return true;
			}
		} else {
			if($first['code'] == $tokenCode) {
				return true;
			}
		}
		return false;
	}

	public function parseToken($token) {
		if((int)$token[0]) {
			if($token[0] == T_CONSTANT_ENCAPSED_STRING || $token[0] == T_ENCAPSED_AND_WHITESPACE) {
				$token[0] = T_STRING_LITERAL;
			}
			return array(
			'code'  => $token[0],
			'value' => $token[1]
			);
		} else {
			return array(
			'code'  => T_TERMINAL,
			'value' => $token[0]
			);
		}
	}
}