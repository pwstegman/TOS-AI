<?php
$url = $_REQUEST['url'];

$regex = '/((?<=[^.]{2})\.(?=[^\w][^.]{2}|$))|[( \n][ivxa-z0-9]*\)/i';

$options  = array('http' => array('user_agent' => 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'));
$context  = stream_context_create($options);

$cache = json_decode(file_get_contents("toscache.json"),true);
/*if(isset($cache[$url]) && time()-$cache[$url]["time"] < 86400){
	$terms = $cache[$url]["terms"];
	$terms = mb_convert_encoding($terms,"UTF-8","auto");
	$terms_str = preg_split($regex,$terms);
	echo json_encode($terms_str);
	exit();
}*/

$doc = new DOMDocument();
$doc->loadHTML(file_get_contents($url,false,$context));
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

/*foreach($currentdiv->getElementsByTagName("li") as $li){

	var_dump($li->parentNode->previousSibling->previousSibling->nodeValue);

	if(strpos($li->parentNode->previousSibling->nodeValue, "not") !== false){
		$text = "(Don't) ".$li->nodeValue.".";
		while($li->childNodes->length){
	        $li->removeChild($li->firstChild);
	    }
		$li->insertBefore(new DOMText($text), $li->firstChild);
	}
}*/

$terms = $currentdiv->nodeValue;



$cache[$url] = array("time"=>time(),"terms"=>$terms);

file_put_contents("toscache.json", json_encode($cache));

$terms = mb_convert_encoding($terms,"UTF-8","auto");

$terms = preg_split($regex,$terms);

echo json_encode($terms);

?>