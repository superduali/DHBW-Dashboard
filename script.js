$( document ).ready( setup );



function setup(){
  $("#update").on("click",update);
  $("#settings").on("click",settings);
  $("#close").on("click",close);
  $("#mensa").on("click",mensa);
  chrome.storage.sync.get("kurs", function (obj) {
    $("#kursid").val(obj.kurs);
    loadPlan();
  });
  $("#kursid").on("keyup",changeKursID);

}

function loadPlan(){
  var uid = $("#kursid").val();
  var url = "http://vorlesungsplan.dhbw-mannheim.de/index.php?action=view&uid="+uid;
  $.get( url, function() {
  })
    .done(function(data) {


      $("#heute").append( parse( data,0 ) );
      $("#morgen").append( parse( data,1 ) );
      var kursname = $(data).find(".header-txt-c > h1 > span").text();
      $("#kursname").text(kursname);

  });

}
function parse(html,dayoffset){
  var time = new Date()
  var result
  result =  $(html).find("[data-role='listview']")[time.getDay()- 1 + dayoffset ];
  return result;
}

function settings(){
  $("#settingslayer").fadeIn();
}

function update(){
  $("#heute").text("");
  $("#morgen").text("");
  loadPlan();
}

function close(){
  $("#settingslayer").fadeOut();
}

function changeKursID(){
  var id = $("#kursid").val();
  chrome.storage.sync.set({"kurs": id})
  update();
}

function loadKursID(data){
  console.log(data);
  return data;
}

function mensa(){
    console.log("https://www.stw-ma.de/Essen%20_%20Trinken/Men%C3%BCpl%C3%A4ne/Mensaria%20Metropol-date-2015_02_16-pdfView-1.html");
}