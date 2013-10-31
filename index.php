<?php
// Codes by scarlet, EBS PoolC

// include Epi Library.
include_once './Epi/Epi.php';
Epi::setPath('base', './Epi');
Epi::init('api');

// Setup Database.
Epi::init('database');
EpiDatabase::employ('mysql', 'bicycle', 'localhost', 'bicycle', 'cyzhgkdla');

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

function error($error_string = 'Unknown Error', $code = -1) {
	return with_status($error_string, $code);
}

function is_logged() {
	return !!(getSession()->get('uid'));
}

// Routes

// 0. Internal API.

// 1. Static Page API.

// 2. Ajax Request API.
getApi()->post('/user/login', array('User', 'login'), EpiApi::external); // school_id : integer.
getApi()->post('/user/logout', array('User', 'logout'), EpiApi::external); // NONE

getApi()->get('/racks', array('Rack', 'get_all'), EpiApi::external);
getApi()->get('/racks/(\d+)', array('Rack', 'get_one'), EpiApi::external);

// End Routes
getRoute()->run();

// Routines

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
			return error('Wrong Student ID Form');
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
		if (!is_logged()) return error('Permission Denied', -99);

		$racks = getDatabase()->all('SELECT * FROM `rack` ORDER BY `rid` ASC');
		return with_status($racks);
	}

	public static function get_one($rid) {
		if (!is_logged()) return error('Permission Denied', -99);

		$rack = getDatabase()->one('SELECT *, 
			(SELECT COUNT(*)`bicycle` WHERE `current_rack` = `rack`.`rid`) AS `total_count`, 
			(SELECT COUNT(*)`bicycle` WHERE `current_rack` = `rack`.`rid` AND `reserved` = 0) AS `free_count`
			FROM `rack` WHERE `rid` = :rid GROUP BY `current_rack` LIMIT 1', 
			array(':rid' => $rid)
		);

		return with_status($rack);
	}
}

?>