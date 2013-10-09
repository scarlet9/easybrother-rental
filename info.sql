-- 맞는 학번 찾아보기
select `uid`, `name` from `user` where `user`.`school_id` = '2010147106' limit 1;

-- 모든 거치대 정보 가져오기
select `rack`.*, count(*) as `count`
from `rack` 
join `bicycle` on `current_rack`
where `reserved` = 0
group by `current_rack`;

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
