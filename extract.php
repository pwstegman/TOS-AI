<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>

<?php

$url = $_GET['url'];

$html = mb_convert_encoding(
    file_get_contents($url),
    "HTML-ENTITIES",
    "UTF-8"
  );

$doc = new DOMDocument();
$doc->loadHTML($html);
$divs = $doc->getElementsByTagName('div');

$maxratio = 0;
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

	$ratio = $ptags/$children;

	if($ratio > $maxratio){
		$maxratio = $ratio;
		$currentdiv = $n;
	}
}
echo $currentdiv->nodeValue;
?>

</body>
</html>