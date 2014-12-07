<?php

$name = urlencode($_GET['name']);
$googleUrl = "http://www.google.com/search?hl=en&q=".$name."+terms&btnI=1";
$headers = get_headers($googleUrl, 1);
$url = $headers['Location'];
if(is_array($url))
	$url = $url[0];

echo $url;