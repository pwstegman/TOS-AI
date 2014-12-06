<?php

if(isset($_POST['title']) && isset($_POST['text']) && isset($_POST['selected'])){
	write_json();
	exit();
}

if(isset($_POST['id'])){
	delete_json();
	exit();
}

if(isset($_POST['wordscores'])){
	saveScores();
	exit();
}

function write_json(){
	$data = json_decode(file_get_contents("save.json"));
	array_push($data,array("title"=>$_POST['title'],"text"=>$_POST['text'],"selected"=>$_POST['selected']));
	file_put_contents("save.json",json_encode($data));
}

function delete_json(){
	$data = json_decode(file_get_contents("save.json"));
	array_splice($data,$_POST['id'],1);
	file_put_contents("save.json",json_encode($data));
}

function saveScores(){
	file_put_contents("scores.json", json_encode($_POST['wordscores']));
	$csv = array();
	foreach ($_POST['wordscores'] as $k => $v) {
    	array_push($csv,array($k,$v));
	}
	$fp = fopen('scores.csv', 'w');
	foreach ($csv as $fields){
		fputcsv($fp, $fields);
	}
	fclose($fp);
}