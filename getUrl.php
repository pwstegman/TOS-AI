<?php

$name = urlencode($_POST['name']);

$cache = json_decode(file_get_contents("urlcache.json"),true);
if(isset($cache[$name]) && time()-$cache[$name]["time"] < 86400){
	echo $cache[$name]["url"];
	exit();
}

$googleUrl = "http://www.google.com/search?hl=en&q=".$name."+terms&btnI=1";
$headers = get_headers($googleUrl, 1);
$url = $headers['Location'];
if(is_array($url))
	$url = $url[0];

$cache[$name] = array("time"=>time(),"url"=>$url);
file_put_contents("urlcache.json", json_encode($cache));

echo $url;