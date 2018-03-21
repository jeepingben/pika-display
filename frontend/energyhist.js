var serial = "";
var year = "";
var energydata = [];
var energyHist = {};



$(document).ready(function()
{
	serial = document.location.search.substr(8,12);
	year = document.location.search.substr(26,4);
	$.getJSON("all-energy.json?serial="+serial+"&year="+year)
    .done (function(result) {
    	  hideError();
    	  addMissingDays(result);
        loadNewData(result);
        addChart();
	hideError();
    })
    .fail (showError);		
	
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
	energyHist = new Highcharts.chart({
										chart: {
										renderTo: 'energybyday',
                              zoomType: 'x',
                              resetZoomButton: {
							            position: {
							                x: 0,
							                y: -35
							            }
							         },
                              panning: true,
                              panKey:  'shift',
				// height:  '65%',
				},
				tooltip: {
        valueSuffix: ' kwh',
    },
global: {
                              	useUTC: false,
                                 timezoneOffset: 4 * 60,
                              },
series:  [{
                                 type: 'column',
                                 data: energydata,
                                 name: serial,
                                 lineColor: '#70A4B2',
                                 color: '#6F3D86',                             
                                 
                              }],

										
                                 title:{
                                 			display:true,
                                 			text: 'Energy Captured per Day',
                                 		},

                             
                                xAxis: {
                                		type: 'datetime',
												dateTimeLabelFormats: {
       									       day: '%Y-%m-%d'
    									      },
                                		labels: {
	                                    formatter: function () {
	                                    	var self = this;
	                                       var label = this.axis.defaultLabelFormatter.call(self);
													   return label;
												   },
												},
                                		title: {
                                		text: 'date',
                                		
                                	},
                                },
                             
                                yAxis: {
                                    title: {
                                       text: 'Kilowatt-hours'
                                    },                                    
                                },
                                       
									}
										);
								
}

function addMissingDays(energyarray)
{
	var date = new Date(energyarray.energy[0][0]);
	var energyindex = 0;
	var end = new Date(energyarray.energy[energyarray.energy.length-1][0]);
	while (date < end)
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
		var entry = {};
		
		entry.name = this[0];
		entry.x = Date.parse(this[0]);
		entry.y = parseFloat((this[1] / 1000.0).toFixed(1));
		energydata.push(entry);
	});
	
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


