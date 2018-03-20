var serial = "";
var energydata = {};
var energyHist = {};
energydata.datasets=[];
energydata.labels=[];
energydata.datasets[0]={};

energydata.datasets[0].backgroundColor = "#AAFF66";
energydata.datasets[0].borderColor = "#AAFF66";

$(document).ready(function()
{
	serial = document.location.search.substr(8,12);
	energydata.datasets[0].label = "kwh by month";
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


function addChart()
{
	energyHist = new Chart($("#energybyday"), {
										type: "bar",
										data: energydata,
										options:{responsive: true,
										         zoom:{enabled: true,
										               mode:   'x',},
                                       pan:{enabled:true,
                                            mode: 'x',},
                                       title:{
                                       			display:true,
                                       			text: 'Energy Captured per Month',
                                       		},
                                       tooltips:{
                                                callbacks:
                                                	{
                                                	label: function(tooltipItems, data){
                                                		return tooltipItems.yLabel + ' KWh';},
                                                	}
                                                },
									}}
										);
	$.getJSON("all-energy.json?serial="+serial+"&bymonth=1")
    .done (function(result) {
    	  hideError();
        loadNewData(result);
    })
    .fail (showError);									
}

function loadNewData(incoming)
{
	$.each(incoming.energy,function()
	{
		energydata.labels.push( this[0]);
		
		energydata.datasets[0].data.push((this[1] / 1000.0).toFixed(1));
	});
	
	energyHist.update();
}
function updateChart()
{
	
}

function showError()
{
	$("#errormessage").show();
}
function hideError()
{
	$("#errormessage").hide();
}


