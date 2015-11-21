<?php
$jsonData = $_POST['name'];

$f = fopen('records.json', 'w');
fwrite($f,"");
fclose($f);
$f = fopen('records.json', 'a+');
fwrite($f, $jsonData);
fclose($f);