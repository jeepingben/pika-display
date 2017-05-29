
var serial = "";
var powerdata = {};
var powerChart = {};
powerdata.datasets=[];
powerdata.labels=[];
powerdata.datasets[0]={};

powerdata.datasets[0].backgroundColor = "#9A6759";
powerdata.datasets[0].borderColor = "#70A4B2";

$(document).ready(function()
{
	serial = document.location.search.substr(8,99);
	powerdata.datasets[0].label = serial;
	addPowerChart();
	addChart();
	hideError();
	setInterval(updateChart(),6000);
}
);
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}


function addPowerChart()
{
	powerChart = new Chart($("#powertoday"), {
										type: "line",
										data: powerdata,
										options:{responsive: true,
										         zoom:{enabled: true,
										               mode:   'x',},
                                       pan:{enabled:true,
                                            mode: 'x',},
                                       title:{
                                       			display:true,
                                       			text: 'Power production today',
                                       		},
                                       tooltips:{
                                                callbacks:
                                                	{
                                                	label: function(tooltipItems, data){
                                                		return tooltipItems.yLabel + ' Watts';},
                                                	}
                                                },
									}}
										);
	$.getJSON("all-power.json?serial="+serial+"&todayonly=true")
    .done (function(result) {
    	  hideError();
    	  //addMissingDays(result);
        loadNewPowerData(result);
    })
    .fail (showError);									
}


function loadNewPowerData(incoming)
{
	$.each(incoming.entries,function()
	{
		var time = new Date(0);
      time.setUTCSeconds(this[0]);
		powerdata.labels.push(time.getHours() + ":"+ pad(time.getMinutes(),2));
		
		powerdata.datasets[0].data.push((this[1]).toFixed(0));
	}),powerChart.update();
	
}
function updateChart()
{
	
}
function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function showError()
{
	$("#errormessage").show();
}
function hideError()
{
	$("#errormessage").hide();
}


