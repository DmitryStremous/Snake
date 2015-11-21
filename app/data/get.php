<?php
$results = file('records.txt');

foreach($results as $result)
{
	$arr = explode(':', $result);
	echo '<p>' . $arr[0] . ' ________ ' . $arr[1] . 'очков</p>';
}
