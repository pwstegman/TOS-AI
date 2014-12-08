<?php
$data = $_POST["data"];
$regex = '/((?<=[^.]{2})\.(?=[^\w][^.]{2}|$))|[( \n][ivxa-z0-9]*\)/i';
echo json_encode(preg_split($regex, $data));
?>
