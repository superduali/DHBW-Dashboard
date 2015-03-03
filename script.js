String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


$( document ).ready( setup );
setInterval(loadStaticData,60000);
var datastore = {};
var API_KEY = "g6G47ZUDSJ%2B5CoDlh41qJCcp0B9BqU348eUpHdUveTqTrEf4n6LVTrFBpATxUOjFB1AqRd2uK%2BBL4cPJlR75fg%3D%3D";
var MENSA_API = "ec5a49ed-dcdf-4f60-951b-6935759bc071";
var PLAN_API = "87d7b852-1980-4ea8-94ae-3d5d0999f987";
var BUS_API = "81a322e8-9e2b-485f-88de-6d14a0525613";




/**
 * setup - description
 * register event handlers
 *
 */
function setup(){
  console.log("setup");
  $("#update").on("click",loadDynamicData);
  $('#fullscreen').on('click',dockWindow);
  $("#settings").on("click",settings);
  $("#closesettings").on("click",close);
  $("#kursid").on("keyup",changeKursID);
  $("#haltestelle").on("keyup",changeStation);
  $(".autofill li").on("click",autofill);
  loadChromeData();
}


/**
 * loadChromeData - description
 * loads the data stored in chrome storrage
 * This function is asynchronous
 *
 */
function loadChromeData(){
  console.log("loadChromeData");
    chrome.storage.sync.get(function (obj) {
      $("#kursid").val(obj.kurs);
      $("#haltestelle").val(obj.stop);
      datastore.kurs_uid = obj.kurs;
      changeStation();
      loadStaticData();
    });
}


/**
 * loadStaticData - description
 * loading fo statical Data
 *    DHBW Plan
 *    Mensa Plan
 *
 * data is stored in datastore variable
 */
function loadStaticData(){
  console.log("loadStaticData");
  //set current Date and Time
  datastore.now = new Date();


  //build API url's
  //Content url's
  var planurl = "http://vorlesungsplan.dhbw-mannheim.de/index.php?action=view&uid="+datastore.kurs_uid;
  var mensaurl = "https://www.stw-ma.de/Essen+_+Trinken/Men%C3%BCpl%C3%A4ne/Mensaria+Metropol-date-"+datastore.now.toJSON().replace(/T.*/,"").replace(/-/g,"_")+"-pdfView-1.html";
  //API url's
  var mensaapi_url = "https://api.import.io/store/data/"+MENSA_API+"/_query?input/webpage/url="+encodeURIComponent(mensaurl)+"&_user=e2eb28a4-f0c6-4b15-946c-4b933cd2d167&_apikey="+API_KEY;
  var planapi_url = "https://api.import.io/store/data/"+PLAN_API+"/_query?input/webpage/url="+encodeURIComponent(planurl)+"&_user=e2eb28a4-f0c6-4b15-946c-4b933cd2d167&_apikey="+API_KEY;


  $.get( planapi_url, function() {
  })
    .done(function(data){
      datastore.plan = data;
      $.get( mensaapi_url, function() {
      })
        .done(function(data){
          datastore.mensa = data;
          loadDynamicData();
        }
      );
    }
  );
}


/**
 * loadDynamicData - description
 *
 * loads Data that needs to be reloaded every minute
 * * Bus-Plan
 */
function loadDynamicData(){
  console.log("loadDynamicData");
  var busurl = "http://efa9-5.vrn.de/dm_rbl/XSLT_DM_REQUEST?itdLPxx_dmlayout=vrn&itdLPxx_realtime=1&limit=4&useRealtime=1&depType=stopEvents&typeInfo_dm=stopID&nameInfo_dm="+(6000000+datastore.hs)+"&mode=direct";
  var busapi_url = "https://api.import.io/store/data/"+BUS_API+"/_query?input/webpage/url="+encodeURIComponent(busurl)+"&_user=e2eb28a4-f0c6-4b15-946c-4b933cd2d167&_apikey="+API_KEY;
  $.get( busapi_url, function(){})
    .done(function(data){
      datastore.bus = data;
      processData();
    });
}


/**
 * processData - description
 * prepares Data for display and places it on the screen
 *
 * @return {type}  description
 */
function processData(){
  console.log("processData");
  processPlan();
  processMensa();
  processBus();
}

function processPlan(){
    parsePlan("#heute",0);
    parsePlan("#morgen",1);
}

function processMensa(){
  parseMensa("#mensaplan");
}

function processBus(){
  var data = datastore.bus;

	chrome.storage.sync.get("stop", function(items) {
		
		var stopName = "Fahrplan";
		if(items.hasOwnProperty("stop")) {
			stopName = items.stop;
		}
		
		var result = '<ul>';
		result = result + '<li data-role="list-divider">'+stopName+'</li>';
		for(key in data.results) {
			result = result + '<li><div class="item-icon-wrapper"><div class="item-icon">';
			if(data.results[key].icon.endsWith("bus.png")) {// || data.results[key].icon.endsWith("s_bahn.png") || data.results[key].icon.endsWith("ice.png") || data.results[key].icon.endsWith("regionalbahn.png")) {
				// bus icon
				result = result + '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#999999" d="M18,11H6V6H18M16.5,17A1.5,1.5 0 0,1 15,15.5A1.5,1.5 0 0,1 16.5,14A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 16.5,17M7.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,14A1.5,1.5 0 0,1 9,15.5A1.5,1.5 0 0,1 7.5,17M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16Z" /></svg>';
			} else {
				// tram icon
				result = result + '<svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#999999" d="M18,10H6V5H18M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M4,15.5A3.5,3.5 0 0,0 7.5,19L6,20.5V21H18V20.5L16.5,19A3.5,3.5 0 0,0 20,15.5V5C20,1.5 16.42,1 12,1C7.58,1 4,1.5 4,5V15.5Z" /></svg>';
			}
			result = result + '</div><div class="flex-box">';
			result = result + '<span><strong>'+data.results[key].abfahrt+'</strong>';
			if(data.results[key].hasOwnProperty('time')) {

				var colorClass = 'color-red';
				if(data.results[key].time.endsWith("nktlich"))
					colorClass = 'color-green';

				result = result + ' <span class="'+colorClass+'">'+data.results[key].time+'</span>';
			}
			result = result + '<br>'+data.results[key].direction+'</span>';
			result = result + ' <span>'+data.results[key].linie+'</span>';
			result = result + '</div>';
			result = result + '</div></li>';
		}
		result = result + '</ul>';
		$('#busplan').html(result);

	});
}


function autofill(){
  $("#haltestelle").val($( this ).html());
  changeStation();
}

function changeStation(){
    var value = $("#haltestelle").val();
    var result = search(vrn,value);
    if(value === "" || (decodeHtml(result[0].hs) == value)){
      $("#autofill_stop").slideUp();
      if(result.length == 1){
        $(".haltestellenid").text(result[0].value);
        chrome.storage.sync.set({"stop": decodeHtml(result[0].hs)});
        datastore.hs=result[0].value;
        loadDynamicData();
      }
    }
    else{
      if(result.length > 0){
          $("#autofill_stop").slideDown();
          $("#autofill_stop_1").slideDown();
          $("#autofill_stop_1").html(result[0].hs);
      }
      else{
        $("#autofill_stop").slideUp();
      }
      if(result.length > 1){
        $("#autofill_stop_2").slideDown();
        $("#autofill_stop_2").html(result[1].hs);
      }
      else{
        $("#autofill_stop_2").slideUp();
      }
      if(result.length > 2){
        $("#autofill_stop_3").slideDown();
        $("#autofill_stop_3").html(result[2].hs);
      }
      else{
        $("#autofill_stop_3").slideUp();
      }
    }
}


function parsePlan(object,offset){
  var day = datastore.now.getDay();
  var kursname = datastore.plan.results[0].kurs;
  $(".kursname").text( (kursname.length > 0) ? kursname : "Kein Kurs eingetragen");
  var html = datastore.plan.results[datastore.now.getDay()-1+offset];
  if(typeof html == "object"){
    var result = '';
    result = result + '<ul>';
    result = result + '<li data-role="list-divider">'+germanDateString(html.day)+'</li>';
    if(typeof html.time === 'object')
    for (var key in html.kurs_name){
      result = result + '<li><strong>'+prepareTimeString(html.time[key],html.day)+'</strong><br>'+html.kurs_name[key]+'<br>'+html.raum[key]+'</li>';
    }
    else{
      result = result + '<li><strong>'+prepareTimeString(html.time,html.day)+'</strong><br>'+html.kurs_name+'<br>'+html.raum+'</li>';
    }
    result = result + '</ul>';
    $(object).html( result );
  }
}

function parseMensa(object){
  //var day = (time.getDay()-1)*2;//TODO
  var day = (datastore.now.getDay()-1)*2;
  var data = datastore.mensa;
  var html = '';
  html = html + '<ul>';
  html = html + '<li data-role="list-divider">Mensaria Metropol</li>';
  html = html + '<li><div class="flex-box"><div>'+data.results[day].menu_1+'</div><strong class="price">'+data.results[day+1].menu_1.replace(',','.')+'</strong></div></li>';
	html = html + '<li><div class="flex-box"><div>'+data.results[day].menu_2+'</div><strong class="price">'+data.results[day+1].menu_2.replace(',','.')+'</strong></div></li>';
  html = html + '<li><div class="flex-box"><div>'+data.results[day].vegetarisch+'</div><strong class="price">'+data.results[day+1].vegetarisch.replace(',','.')+'</strong></div></li>';
  html = html + '</ul>';
  html = html.replace(/ *\[[^\]]*\] */g, "");
  html = html.replace(/\,/g, "<br>");
  $(object).html(html);

}



function changeKursID(){
  var id = $("#kursid").val();

	if(id.substring(0,4) == "http") {
		id = id.split("uid=")[1];
		$("#kursid").val(id);
	}

  chrome.storage.sync.set({"kurs": id})
  loadStaticData();
}

function germanDateString(day){
  var weekday = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
  var date = new Date(day);
  return weekday[date.getDay()-1] + " - " + date.getDate() + "." + (date.getMonth()+1) + ".";
}

function prepareTimeString(time,day){
  datastore.now = new Date();
  var now = datastore.now;
  var result = "";
  if(typeof time === "string"){
    result = time;
    var times =  time.split(/[:-]/);
    times=[times[0]*60+times[1]*1,times[2]*60+times[3]*1];
    if(day-now < 0){
      now = (now.getHours()*60)+now.getMinutes();
      if(times[0]<=now){
        if(times[1]>=now){
          var diff = times[1]-now;
          var minutes = (diff%60);
          minutes = (minutes < 10) ?("0"+minutes):minutes;
          result = result + '</strong><span class="color-green"> noch '+(Math.floor(diff/60))+':'+minutes+'</span><strong>';
        }
      }
    }
  }
  return result;
}

function search(array,term){

  var result = [];
  for(var  i = 0 ; i < array.length ; i++){
    if (decodeHtml(array[i].hs).toLowerCase().indexOf(term.toLowerCase())>-1) {
      result.push(array[i]);
    }
  }
  return result;

}


function dockWindow(){
  window.resizeTo(450,10000);
  window.moveTo(10000,0);
}

function decodeHtml(html) {
//		return html;//TODO
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
