var serial = "";
var energydata = {};
var energyHist = {};
energydata.datasets=[];
energydata.labels=[];
energydata.datasets[0]={};
energydata.datasets[0].label = "Inverter";
energydata.datasets[0].backgroundColor = "#6F3D86";
energydata.datasets[0].borderColor = "#70A4B2";
$(document).ready(function()
{
	
	serial = document.location.search.substr(8,99);
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
                                       			text: 'Energy Captured per Day',
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
	$.getJSON("all-energy.json?serial="+serial)
    .done (function(result) {
    	  hideError();
    	  addMissingDays(result);
        loadNewData(result);
    })
    .fail (showError);									
}

function addMissingDays(energyarray)
{
	var date = new Date(energyarray.energy[0][0]);
	var energyindex = 0;
	var today = new Date();
	while (date < today)
	{
		var foo = new Date(energyarray.energy[energyindex][0]);
		
		if (foo > date)
		{
			energyarray.energy.splice(energyindex, 0,[date.toISOString().substr(0,10) ,null]);
		}
		
		date = date.addDays(1);
		energyindex++;
	}
		
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


