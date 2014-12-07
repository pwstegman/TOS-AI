<html>
<head>
<meta charset="UTF-8">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
<link rel="stylesheet" href="style.css">
<script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
</head>
<body>

  <div class="container">

    <h1>AI Trainer</h1>

    <?php if(isset($_GET['train'])){ ?>

    <p><input id="train_url" type="text" placeholder="Name of website"/> <input type="button" value="Load" onclick="train_load();"/></p>
    <p><div id="train_txt" class="loadedHtml"></div></p>
    <p>
    <input id="highlight" type="button" value="Done highlighting" disabled/>
    <input id="reset" type="button" value="Reset"/>
    </p>
    <p><div id="out" class="noselect" style="max-height:650px; overflow:auto;"></div></p>
    <hr/>
    <div id="results"></div>
    <p><i>Auto updates</i></p>
    <p><div id="entries"></div></p>
    <p id="viewer"></p>
    <hr/>

    <?php
        }
        if(isset($_GET['results'])){
    ?>

    <p><input type="button" onclick="calcWords();" value="Retrain AI"/></p>
    <p id="scoreResult" style="display:none;">AI Training results: <a href="scores.json">JSON</a> or <a href="scores.csv">CSV</a></p>
    <hr/>

    <?php
    }
    if(isset($_GET['test'])){
    ?>

    <p><input id="test_url" type="text" placeholder="Name of website"/> <input type="button" value="Load" onclick="test_load();"/></p>
    <p><div id="test_txt" class="loadedHtml"></div></p>
    <div id="sum"></div>

    <?php } ?>

  </div>

  <script src="main.js"></script>

</body>
</html>
