
$("#reset").click(resetData);
$("#highlight").click(saveData);
$(document).ready(function(){
   $("#highlight").prop("disabled",true);
   $.get( "scores.json", function( data ) {
    wordScores = data;
    for (var key in wordScores) {
      if (wordScores.hasOwnProperty(key)) {
        wordScores[key] = parseInt(wordScores[key]);
      if(isNaN(wordScores[key])){
        wordScores[key] = 0;
      }
      }
    }
    },"json");
});

var sentences = [];
var selected = [];

function resetData(){
  sentences = [];
  selected = [];
  $("#out").html("");
  $("#highlight").prop("disabled",true);
}

function saveData(){
  $("#highlight").prop("disabled",true);
  $.post( "db.php", { text: sentences, selected: selected, title: $("#train_url").val() }).done(function( data ) {
    resetData();
    loadEntries(false);
  });
}

var train_txt;

function processData(){
  sentences = train_txt;
  console.log(sentences);
  var s_i=0;
  while(s_i<sentences.length){
    if(isBlank(sentences[s_i])){
      sentences.splice(s_i,1);
    }else{
      s_i ++;
    }
  }
  renderData();
  $("#highlight").prop("disabled",false);
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function renderData(){
  var txt = "";
  var style = "";
  for(var i=0;i<sentences.length;i++){
    style = "";
    if(selected.indexOf(""+i) != -1)
      style = "style='background-color:#0174DF;'";
    txt += "<span id='sentence"+i+"' class='sentence' onclick='selectSentence(this);' "+style+">"+sentences[i]+". </span>";
  }
  $("#out").html(txt);
}

function selectSentence(e){
  var id = e.id;
  id = id.split("sentence")[1];
  if(selected.indexOf(id) == -1)
    selected.push(id);
  else
    selected.splice(selected.indexOf(id),1);
  renderData();
}


var titles = [];
var texts = [];
var selects = [];
var firstCalc = false;
function loadEntries(b){
  $.get( "save.json?r="+Math.random(), function( data ) {
    var txt = "<ol>";
    for(var i=0;i<data.length;i++){
      titles[i] = data[i].title;
      texts[i] = data[i].text;
      selects[i] = data[i].selected;
      txt += "<li><b>"+data[i].title+"</b> [<a href='#' onclick='view("+i+");'>view</a>]</li>";
      //[<a href='#' style='color:red;' onclick='deleteItem("+i+");'>delete</a>]
    }
    txt += "</ol>";
    $("#entries").html(txt);
    if(data.length == 0){
      $("#entries").html("No entries yet");
    }
    if(firstCalc == false){
      calcWords();
      firstCalc = true;
    }
    if(b)
      setTimeout(function(){loadEntries(true);},10000);
  },"json");
}

function deleteItem(id){
  var text = prompt("Enter title of entry to confirm", "");
  if (text == titles[id]) {
    $.post( "db.php", { id: id }).done(function( data ) {
      loadEntries(false);
    });
  }else if(text != null){
    alert("Incorrect");
  }
  
}

function view(id){
  var txt = "<hr/><a href='#' onclick='clearViewer();'>clear</a> "+(id+1)+". ";
  var style = "";
  for(var i=0;i<texts[id].length;i++){
    style = "";
    if(selects[id].indexOf(""+i) != -1)
      style = "style='background-color:#0174DF;'";
    txt += "<span "+style+">"+texts[id][i]+". </span>";
  }
  $("#viewer").html(txt);
}

function clearViewer(){
  $("#viewer").html("");
}

function calcWords(){
  wordsin = {};
  wordsout = {};
  numin = 0;
  numout = 0;
  for(var i=0;i<texts.length;i++){
    for(var j=0;j<texts[i].length;j++){
      var s = texts[i][j].split(/\s/);
      for(var k=0;k<s.length;k++){
        s[k] = s[k].replace(/[^\w]/g,"").toLowerCase();
        if(selects[i].indexOf(""+j) == -1){
          numout += 1;
          if(s[k] in wordsout)
            wordsout[s[k]] += 1;
          else
            wordsout[s[k]] = 1;
        }else{
          numin += 1;
          if(s[k] in wordsin)
            wordsin[s[k]] += 1;
          else
            wordsin[s[k]] = 1;
        }
      }
    }
  }

  wordScores = {};

  $.each( wordsin, function( key, value ) {
    wordScores[key] = value*10000/numin;
  });
  $.each( wordsout, function( key, value ) {
    if(key in wordScores)
      wordScores[key] -= value*10000/numout;
    else
      wordScores[key] = -value*10000/numout;
  });

  $.post( "db.php", { wordscores: wordScores }).done(function( data ) {
    $("#scoreResult").show();
    $("#test_btn").prop("disabled",false);
  });

}

var test_txt;
var s_scores;
var min_score;

function scoreSentences(){

    $("#show").hide();
    $("#sum").hide();

    var s = test_txt;
    s_scores = [];
    for(var i=0;i<s.length;i++){
      var score = 0;
      var words = s[i].replace(/[^\w\s]/g,"").toLowerCase().split(/\s/);
      for(var j=0;j<words.length;j++){
        if(words[j].length > 0 && words[j] in wordScores){
          score += wordScores[words[j]];
        }
      }
      s_scores[i] = score;
    }
    var scores_copy = s_scores.slice(0);
    scores_copy.sort(function (a, b) { 
      return b - a;
    });
    min_score = 0;
    if(scores_copy.length >= 10){
      min_score = scores_copy[9];
    }else{
      min_score = scores_copy[scores_copy.length-1];
    }
    var results = [];
    for(var i=0;i<s.length;i++){
      if(s[i].length > 0 && s_scores[i] >= min_score)
        results.push([i,s_scores[i]]);
    }
    results.sort(compareSecondColumn);
    var txt = "<ol>";
    for(var i=0;i<results.length;i++){
      txt += "<li>"+fixCase(s[results[i][0]])+" (Importance score: "+Math.floor(results[i][1]*10)/10+")</li>";
    }
    txt += "</ol>";
    $("#sum").html(txt);
    showProcess();
}

function showProcess(){
  var text = "";
  for(var i=0;i<test_txt.length;i++){
    text += "<span id='piece"+i+"'>"+test_txt[i].trim()+". </span>";
  }
  $("#show").html(text);
  $("#show").show("slow",function(){
    setTimeout(function(){
      showScore(0);
    },500);
  });
}

function showScore(i){

  if(s_scores[i] < min_score){
    $("#piece"+i).css("color","red");
  }else{
    $("#piece"+i).css("color","blue");
  }
  i++;
  if(i < s_scores.length){
    setTimeout(function(){showScore(i);},50);
  }else{
    setTimeout(finishAnim,1000);
  }
}

function finishAnim(){
  $("#show").hide("slow",function(){
    $("#show").html($("#show").html()+"<hr/>");
    $("#sum").show("slow", function(){
      $("#reshow").show("slow");
    });
  });
}

function reshow(){
  if($("#reshowbtn").text() == "Reshow highlighted terms"){
    $("#reshowbtn").text("Hide highlighted terms");
  }else{
    $("#reshowbtn").text("Reshow highlighted terms");
  }
  $("#show").toggle("slow");
}

function fixCase(str){
  str = str.trim();
  if(str.toUpperCase() == str){
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
  }else{
    return str.charAt(0).toUpperCase() + str.substr(1);
  }
}

function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

function tos_from_url(url,id){
  $.post( "extract.php", { url: url }, function( data ) {
    console.log(data);
    if(id == "train_txt"){
      train_txt = data;
      processData();
    }
    if(id == "loaded"){
      $("#tos").val(data);
    }
  });
}

function loadByName(){
  $.post( "getUrl.php", { name: $("#sitename").val() }).done(function( data ) {
    tos_from_url(data,"loaded");
  });
}

function train_load(){
  resetData();
  $.post( "getUrl.php", { name: $("#train_url").val() }).done(function( data ) {
    tos_from_url(data,"train_txt");
  });
}

var presets = {"Google":"Google Terms of Service Last modified: April 14, 2014 (view archived versions) Welcome to Google! Thanks for using our products and services (“Services”). The Services are provided by Google Inc. (“Google”), located at 1600 Amphitheatre Parkway, Mountain View, CA 94043, United States. By using our Services, you are agreeing to these terms. Please read them carefully. Our Services are very diverse, so sometimes additional terms or product requirements (including age requirements) may apply. Additional terms will be available with the relevant Services, and those additional terms become part of your agreement with us if you use those Services. Using our Services You must follow any policies made available to you within the Services. Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide. You may use our Services only as permitted by law, including applicable export and re-export control laws and regulations. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct. Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. You may not use content from our Services unless you obtain permission from its owner or are otherwise permitted by law. These terms do not grant you the right to use any branding or logos used in our Services. Don’t remove, obscure, or alter any legal notices displayed in or along with our Services. Our Services display some content that is not Google’s. This content is the sole responsibility of the entity that makes it available. We may review content to determine whether it is illegal or violates our policies, and we may remove or refuse to display content that we reasonably believe violates our policies or the law. But that does not necessarily mean that we review content, so please don’t assume that we do. In connection with your use of the Services, we may send you service announcements, administrative messages, and other information. You may opt out of some of those communications. Some of our Services are available on mobile devices. Do not use such Services in a way that distracts you and prevents you from obeying traffic or safety laws. Your Google Account You may need a Google Account in order to use some of our Services. You may create your own Google Account, or your Google Account may be assigned to you by an administrator, such as your employer or educational institution. If you are using a Google Account assigned to you by an administrator, different or additional terms may apply and your administrator may be able to access or disable your account. To protect your Google Account, keep your password confidential. You are responsible for the activity that happens on or through your Google Account. Try not to reuse your Google Account password on third-party applications. If you learn of any unauthorized use of your password or Google Account, follow these instructions. Privacy and Copyright Protection Google’s privacy policies explain how we treat your personal data and protect your privacy when you use our Services. By using our Services, you agree that Google can use such data in accordance with our privacy policies. We respond to notices of alleged copyright infringement and terminate accounts of repeat infringers according to the process set out in the U.S. Digital Millennium Copyright Act. We provide information to help copyright holders manage their intellectual property online. If you think somebody is violating your copyrights and want to notify us, you can find information about submitting notices and Google’s policy about responding to notices in our Help Center. Your Content in our Services Some of our Services allow you to upload, submit, store, send or receive content. You retain ownership of any intellectual property rights that you hold in that content. In short, what belongs to you stays yours. When you upload, submit, store, send or receive content to or through our Services, you give Google (and those we work with) a worldwide license to use, host, store, reproduce, modify, create derivative works (such as those resulting from translations, adaptations or other changes we make so that your content works better with our Services), communicate, publish, publicly perform, publicly display and distribute such content. The rights you grant in this license are for the limited purpose of operating, promoting, and improving our Services, and to develop new ones. This license continues even if you stop using our Services (for example, for a business listing you have added to Google Maps). Some Services may offer you ways to access and remove content that has been provided to that Service. Also, in some of our Services, there are terms or settings that narrow the scope of our use of the content submitted in those Services. Make sure you have the necessary rights to grant us this license for any content that you submit to our Services. Our automated systems analyze your content (including emails) to provide you personally relevant product features, such as customized search results, tailored advertising, and spam and malware detection. This analysis occurs as the content is sent, received, and when it is stored. If you have a Google Account, we may display your Profile name, Profile photo, and actions you take on Google or on third-party applications connected to your Google Account (such as +1’s, reviews you write and comments you post) in our Services, including displaying in ads and other commercial contexts. We will respect the choices you make to limit sharing or visibility settings in your Google Account. For example, you can choose your settings so your name and photo do not appear in an ad. You can find more information about how Google uses and stores content in the privacy policy or additional terms for particular Services. If you submit feedback or suggestions about our Services, we may use your feedback or suggestions without obligation to you. About Software in our Services When a Service requires or includes downloadable software, this software may update automatically on your device once a new version or feature is available. Some Services may let you adjust your automatic update settings. Google gives you a personal, worldwide, royalty-free, non-assignable and non-exclusive license to use the software provided to you by Google as part of the Services. This license is for the sole purpose of enabling you to use and enjoy the benefit of the Services as provided by Google, in the manner permitted by these terms. You may not copy, modify, distribute, sell, or lease any part of our Services or included software, nor may you reverse engineer or attempt to extract the source code of that software, unless laws prohibit those restrictions or you have our written permission. Open source software is important to us. Some software used in our Services may be offered under an open source license that we will make available to you. There may be provisions in the open source license that expressly override some of these terms. Modifying and Terminating our Services We are constantly changing and improving our Services. We may add or remove functionalities or features, and we may suspend or stop a Service altogether. You can stop using our Services at any time, although we’ll be sorry to see you go. Google may also stop providing Services to you, or add or create new limits to our Services at any time. We believe that you own your data and preserving your access to such data is important. If we discontinue a Service, where reasonably possible, we will give you reasonable advance notice and a chance to get information out of that Service. Our Warranties and Disclaimers We provide our Services using a commercially reasonable level of skill and care and we hope that you will enjoy using them. But there are certain things that we don’t promise about our Services. OTHER THAN AS EXPRESSLY SET OUT IN THESE TERMS OR ADDITIONAL TERMS, NEITHER GOOGLE NOR ITS SUPPLIERS OR DISTRIBUTORS MAKE ANY SPECIFIC PROMISES ABOUT THE SERVICES. FOR EXAMPLE, WE DON’T MAKE ANY COMMITMENTS ABOUT THE CONTENT WITHIN THE SERVICES, THE SPECIFIC FUNCTIONS OF THE SERVICES, OR THEIR RELIABILITY, AVAILABILITY, OR ABILITY TO MEET YOUR NEEDS. WE PROVIDE THE SERVICES “AS IS”. SOME JURISDICTIONS PROVIDE FOR CERTAIN WARRANTIES, LIKE THE IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. TO THE EXTENT PERMITTED BY LAW, WE EXCLUDE ALL WARRANTIES. Liability for our Services WHEN PERMITTED BY LAW, GOOGLE, AND GOOGLE’S SUPPLIERS AND DISTRIBUTORS, WILL NOT BE RESPONSIBLE FOR LOST PROFITS, REVENUES, OR DATA, FINANCIAL LOSSES OR INDIRECT, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES. TO THE EXTENT PERMITTED BY LAW, THE TOTAL LIABILITY OF GOOGLE, AND ITS SUPPLIERS AND DISTRIBUTORS, FOR ANY CLAIMS UNDER THESE TERMS, INCLUDING FOR ANY IMPLIED WARRANTIES, IS LIMITED TO THE AMOUNT YOU PAID US TO USE THE SERVICES (OR, IF WE CHOOSE, TO SUPPLYING YOU THE SERVICES AGAIN). IN ALL CASES, GOOGLE, AND ITS SUPPLIERS AND DISTRIBUTORS, WILL NOT BE LIABLE FOR ANY LOSS OR DAMAGE THAT IS NOT REASONABLY FORESEEABLE. Business uses of our Services If you are using our Services on behalf of a business, that business accepts these terms. It will hold harmless and indemnify Google and its affiliates, officers, agents, and employees from any claim, suit or action arising from or related to the use of the Services or violation of these terms, including any liability or expense arising from claims, losses, damages, suits, judgments, litigation costs and attorneys’ fees. About these Terms We may modify these terms or any additional terms that apply to a Service to, for example, reflect changes to the law or changes to our Services. You should look at the terms regularly. We’ll post notice of modifications to these terms on this page. We’ll post notice of modified additional terms in the applicable Service. Changes will not apply retroactively and will become effective no sooner than fourteen days after they are posted. However, changes addressing new functions for a Service or changes made for legal reasons will be effective immediately. If you do not agree to the modified terms for a Service, you should discontinue your use of that Service. If there is a conflict between these terms and the additional terms, the additional terms will control for that conflict. These terms control the relationship between Google and you. They do not create any third party beneficiary rights. If you do not comply with these terms, and we don’t take action right away, this doesn’t mean that we are giving up any rights that we may have (such as taking action in the future). If it turns out that a particular term is not enforceable, this will not affect any other terms. The laws of California, U.S.A., excluding California’s conflict of laws rules, will apply to any disputes arising out of or relating to these terms or the Services. All claims arising out of or relating to these terms or the Services will be litigated exclusively in the federal or state courts of Santa Clara County, California, USA, and you and Google consent to personal jurisdiction in those courts. For information about how to contact Google, please visit our contact page."};

function preset(str){
  $("#tos").val(presets[str]);
}