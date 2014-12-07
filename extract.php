<?php
$url = $_POST['url'];
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
echo $currentdiv->nodeValue;
?>