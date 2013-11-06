<?php
error_reporting(0);

// Codes by scarlet, EBS PoolC

// include Epi Library.
include_once './Epi/Epi.php';
Epi::setPath('base', './Epi');
Epi::init('api');

// Setup Database.
Epi::init('database');
EpiDatabase::employ('mysql', 'bicycle', 'localhost', 'bicycle', 'cyzhgkdla');
getDatabase()->execute('SET NAMES utf8');

// Setup Session.
Epi::init('session');
EpiSession::employ(EpiSession::PHP);

// Setup shortcut functions.
function post($key) {
	return (isset($_POST[$key]))? $_POST[$key] : false;
}

function with_status($data = null, $code = 0) {
	return array('status' => $code, 'data' => $data);
}

function error($error_string = 'Unknown Error', $code = 500) {
	http_response_code($code);
	return with_status(-$error_string, $code);
}

function is_logged() {
	return !!(getSession()->get('uid'));
}

include_once './http_status.php';

// Routes

// 0. Internal API.

// 1. Static Page API.
getRoute()->get('/', array('Page', 'index'));
getRoute()->get('/reservation', array('Page', 'reservation'));
getRoute()->get('/logs', array('Page', 'logs'));
getRoute()->get('/now', array('Page', 'now'));

// 2. Ajax Request API.
getApi()->post('/user/login', array('User', 'login'), EpiApi::external); // school_id : digit string.
getApi()->post('/user/logout', array('User', 'logout'), EpiApi::external); // NONE

getApi()->get('/racks', array('Rack', 'get_all'), EpiApi::external);
getApi()->get('/racks/(\d+)', array('Rack', 'get_one'), EpiApi::external);

getApi()->post('/bicycle/reserve', array('Rent', 'reserve_bicycle'), EpiApi::external); // rid : integer.
getApi()->post('/bicycle/get', array('Rent', 'get_bicycle'), EpiApi::external); // NONE
getApi()->post('/bicycle/return', array('Rent', 'return_bicycle'), EpiApi::external); // rid : integer.
getApi()->post('/bicycle/cancel', array('Rent', 'cancel_bicycle'), EpiApi::external); // NONE

getApi()->get('/logs/fetch', array('Log', 'get_logs'), EpiApi::external);

// End Routes
getRoute()->run();

// Routines
class Page {
	public function check_login() {
		if (!is_logged()) {
			// Get login page first for non-logged-in users.
			include 'login.html';
			exit;
		}
	}

	public static function index() {
		Page::check_login();
		include 'index.html';
	}

	public static function reservation() {
		Page::check_login();
		include 'reservation.html';
	}

	public static function logs() {
		Page::check_login();
		include 'logs.html';
	}

	public static function now() {
		Page::check_login();
		//include 'now.html';
		echo 'now page';
	}
}

class User {
	public static function login() {
		// Check user's school ID.
		$school_id = post('school_id');
		if (preg_match('/^((20\d{8})|(\d{7}))$/', $school_id)) {
			// User id is valid. Now check database to get uid.
			$user = getDatabase()->one('SELECT * FROM `user` WHERE `school_id`=:school_id', 
				array(':school_id' => $school_id)
			);

			if ($user == false) {
				// Insert user.
				$user = array('school_id' => $school_id, 'name' => strval($school_id));
				$user['uid'] = getDatabase()->execute('INSERT INTO `user` (`school_id`, `name`) VALUES (:school_id, :name)', 
					array(':school_id' => $school_id, ':name' => $school_id)
				);
			}
			
			// Write to session.
			getSession()->set('uid', $user['uid']);
			return with_status($user);
		}
		else {
			return error('Wrong Student ID Form', 403);
		}
	}

	public static function logout() {
		// Just delete session.
		$uid = getSession()->get('uid');
		getSession()->end('uid');

		return with_status(null, ($uid)? 0 : 1);
	}
}

class Rack {
	public static function get_all() {
		if (!is_logged()) return error('Permission Denied', 401);

		$racks = getDatabase()->all('SELECT * FROM `rack` ORDER BY `rid` ASC');
		return with_status($racks);
	}

	public static function get_one($rid) {
		if (!is_logged()) return error('Permission Denied', 401);

		$rack = getDatabase()->one('SELECT *, 
			(SELECT COUNT(*) FROM `bicycle` WHERE `current_rack` = `rack`.`rid`) AS `total_count`, 
			(SELECT COUNT(*) FROM `bicycle` WHERE `current_rack` = `rack`.`rid` AND `reserved` = 0) AS `free_count`
			FROM `rack` WHERE `rid` = :rid LIMIT 1', 
			array(':rid' => $rid)
		);

		return with_status($rack);
	}
}

class Rent {
	public static function reserve_bicycle() {
		if (!is_logged()) return error('Permission Denied', 401);
		$uid = getSession()->get('uid');
		$rid = post('rid');

		if ($rid === false) {
			return error('No reserving rack information given.', 403);
		}

		// Check whether this user already had a bicycle reserved or on use.
		$occupied = getDatabase()->one('SELECT * FROM `log` WHERE `uid` = :uid AND `state` <= 2', array(':uid' => $uid));
		if ($occupied) {
			return error('User already has reserved bicycle or is using bicycle.', 403);
		}

		while (true) {
			// Check available bicycle in the rack.
			$bicycle = getDatabase()->one('SELECT * FROM `bicycle` WHERE `current_rack` = :rid AND `reserved` = 0 LIMIT 1', array(':rid' => $rid));

			if (!$bicycle) {
				return error('Bicycles in the rack are already occupied.', 409);
			}

			// Try updating that bicycle.
			$affected = getDatabase()->execute('UPDATE `bicycle` SET `reserved` = 1 WHERE `bid` = :bid AND `reserved` = 0 LIMIT 1', array(':bid' => $bicycle['bid']));

			if ($affected > 0) {
				// Leave a log of reservation.
				getDatabase()->execute('INSERT INTO `log` (`uid`, `bid`, `rack_start`, `time_reserved`, `state`) 
					VALUES (:uid, :bid, :rack_start, NOW(), :state)',
					array(':uid' => $uid, ':bid' => $bicycle['bid'], ':rack_start' => $bicycle['rid'], ':state' => 1)
				);

				return with_status(array('rid' => $bicycle['rid'], 'bid' => $bicycle['bid']));
			}
			else {
				// Someone took that bicycle. Retry.
			}
		}
	}

	public static function get_bicycle() {
		if (!is_logged()) return error('Permission Denied', 401);
		$uid = getSession()->get('uid');

		// Check whether this user already had a bicycle reserved or on use.
		$occupied = getDatabase()->one('SELECT * FROM `log` WHERE `uid` = :uid AND `state` <= 2', array(':uid' => $uid));
		if (!$occupied) {
			return error('User doesn\'t have a reserved bicycle.', 404);
		}
		else if ($occupied['state'] == 2) {
			return error('User is currently using the bicycle.', 403);
		}
		else {
			// Remove bicycle from the rack.
			getDatabase()->execute('UPDATE `bicycle` SET `rack` = NULL WHERE `bid` = :bid LIMIT 1', 
				array(':bid' => $occupied['bid'])
			);

			// Update reserved log to using.
			getDatabase()->execute('UPDATE `log` SET `time_start` = NOW(), `state` = 2 WHERE `lid` = :lid LIMIT 1', 
				array(':lid' => $occupied['lid'])
			);

			return with_status();
		}
	}

	public static function return_bicycle() {
		if (!is_logged()) return error('Permission Denied', 401);
		$uid = getSession()->get('uid');
		$rid = post('rid');

		if ($rid === false) {
			return error('No returning rack information given.', 403);
		}

		// Check whether this user already had a bicycle reserved or on use.
		$occupied = getDatabase()->one('SELECT * FROM `log` WHERE `uid` = :uid AND `state` = 2', array(':uid' => $uid));
		if (!$occupied) {
			return error('User doesn\'t have a using bicycle.', 404);
		}
		else {
			// Mark bicycle unreserved and return to rack.
			getDatabase()->execute('UPDATE `bicycle` SET `reserved` = 0, `current_rack` = :rid WHERE `bid` = :bid LIMIT 1', 
				array(':bid' => $occupied['bid'], ':rid' => $rid)
			);

			// Update reserved log to canceled.
			getDatabase()->execute('UPDATE `log` SET `rack_end` = :rid, `time_end` = NOW(), `state` = 3 WHERE `lid` = :lid LIMIT 1', 
				array(':lid' => $occupied['lid'], ':rid' => $rid)
			);

			return with_status();
		}
	}

	public static function cancel_bicycle() {
		if (!is_logged()) return error('Permission Denied', 401);
		$uid = getSession()->get('uid');

		// Check whether this user already had a bicycle reserved or on use.
		$occupied = getDatabase()->one('SELECT * FROM `log` WHERE `uid` = :uid AND `state` <= 2', array(':uid' => $uid));
		if (!$occupied) {
			return error('User doesn\'t have a reserved bicycle.', 404);
		}
		else if ($occupied['state'] == 2) {
			return error('User is currently using the bicycle.', 403);
		}
		else {
			// Mark bicycle unreserved.
			getDatabase()->execute('UPDATE `bicycle` SET `reserved` = 0 WHERE `bid` = :bid LIMIT 1', 
				array(':bid' => $occupied['bid'])
			);

			// Update reserved log to canceled.
			getDatabase()->execute('UPDATE `log` SET `rack_end` = `rack_start`, `time_start` = NOW(), `time_end` = NOW(), `state` = 4 WHERE `lid` = :lid LIMIT 1', 
				array(':lid' => $occupied['lid'])
			);

			return with_status();
		}
	}
}

class Log {
	public static function get_logs() {
		if (!is_logged()) return error('Permission Denied', 401);
		$uid = getSession()->get('uid');

		$logs = getDatabase()->all('SELECT * FROM `log` WHERE `uid` = :uid ORDER BY `lid` DESC',
			array(':uid' => $uid)
		);
		return with_status($logs);
	}
}

?>