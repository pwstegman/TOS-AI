<?php
$url = $_REQUEST['url'];

$cache = json_decode(file_get_contents("toscache.json"),true);
if(isset($cache[$url]) && time()-$cache[$url]["time"] < 86400){
	echo $cache[$url]["terms"];
	exit();
}

$doc = new DOMDocument();
$doc->loadHTMLFile($url);
$divs = $doc->getElementsByTagName('div');
$currentp = 0;
$currentc = 0;
$currentdiv;
foreach($divs as $n) {
	$children = 0;
	$ptags = 0;
	foreach($n->getElementsByTagName('*') as $child){
		$children += 1;
	}
	foreach($n->getElementsByTagName('p') as $child){
		$ptags += 1;
	}

	if($ptags > $currentp || ($ptags == $currentp && $children < $currentc)){
		$currentdiv = $n;
		$currentp = $ptags;
		$currentc = $children;
	}

}
$terms = $currentdiv->nodeValue;
$cache[$url] = array("time"=>time(),"terms"=>$terms);

file_put_contents("toscache.json", json_encode($cache));
echo $terms;

?>