-- 맞는 학번 찾아보기
select `uid`, `name` from `user` where `user`.`school_id` = '2010147106' limit 1;

-- 모든 거치대 정보 가져오기
SELECT * FROM `rack` ORDER BY `rid` ASC;

-- 거치대 정보 가져오기
SELECT *, 
(SELECT COUNT(*)`bicycle` WHERE `current_rack` = `rack`.`rid`) AS `total_count`, 
(SELECT COUNT(*)`bicycle` WHERE `current_rack` = `rack`.`rid` AND `reserved` = 0) AS `free_count`
FROM `rack` WHERE `rid` = :rid GROUP BY `current_rack`;

-- 예약하기
start transaction;
-- 귀찮으니 나중에.
commit;

-- 예약 취소하기
update `bicycle` set `reserved` = 0 
where `bid` = (select `bid` from `log` where `uid` = '1' and `status` = 0);

-- 내 사용 현황 조회
select `rack_start`, `rack_end`, `time_start`, `time_end`, `time_reserved`, `state`
from `rack`
where `uid` = '1'
order by `state` ASC, `id` ASC;
