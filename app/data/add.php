<?php
$name = $_POST['name'];
$score = $_POST['score'];

$f = fopen('records.txt', 'a+');
fwrite($f, $name . ":" . $score . "\n");
fclose($f);