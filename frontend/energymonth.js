var serial = "";
var year = "";
var energydata = [];
var energyHist = {};



$(document).ready(function()
{
	serial = document.location.search.substr(8,12);
	year = document.location.search.substr(26,4);
	$.getJSON("all-energy.json?serial="+serial+"&bymonth=1")
    .done (function(result) {
        loadNewData(result);
        addChart();
	hideError();
    })
    .fail (showError);		
	
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
										renderTo: 'energybymonth',
                              zoomType: 'x',
                              resetZoomButton: {
							            position: {
							                x: 0,
							                y: -35
							            }
							         },
                              panning: true,
                              panKey:  'shift',
										height:  '65%',
				},
global: {
                              	useUTC: false,
                                 timezoneOffset: 4 * 60,
                              },
series:  [{
                                 type: 'column',
                                 data: energydata,
                                 name: serial,
                                 color: '#AAFF66',                             
                                 
                              }],

										
                                 title:{
                                 			display:true,
                                 			text: 'Energy Captured per Month',
                                 		},

                             tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b><br/>',
        valueSuffix: ' kwh',
        shared: true
    },
                                xAxis: {
                                		type: 'datetime',
												dateTimeLabelFormats: {
       									       day: '%b-%y'
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

function loadNewData(incoming)
{
	var formatter;
        if (typeof(Intl) !== "undefined") {
            formatter = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
	}
        $.each(incoming.energy,function()
	{
		var entry = {};
                if (formatter) {
		entry.name = formatter.format(new Date(this[0]));
                } else {
                 entry.name = new Date(this[0]).toLocaleFormat('%B %Y');
                }
		entry.x = Date.parse(this[0]);
		entry.y = parseFloat((this[1] / 1000.0).toFixed(1));
		energydata.push(entry);
	});
	
}

function showError()
{
	$("#errormessage").show();
}
function hideError()
{
	$("#errormessage").hide();
}


