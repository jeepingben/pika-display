var serial = "";
var date = "";
var powerdata = [];
var powerChart = null;


function addPowerChart()
{
	powerChart = new Highcharts.chart({
                              chart: {
                                 renderTo: 'powertoday',
                                 zoomType: 'x',
                                 panning: true,
                                 panKey:  'shift',
				 height:  '65%',
                              },
                              global: {
                              	useUTC: false,
                                 timezoneOffset: 4 * 60,
                              },
                              tooltip: {
                                 valueSuffix: "watts",
                                 formatter: function() { 
var ttdate = new Date(this.x);
var tooltip = "<tspan>" + ttdate.toLocaleString() + "</tspan><br><tspan>"+this.y+" <b>watts</b></tspan>";
  return tooltip;},
                              },
                              series:  [{
                                 type: 'area',
                                 data: powerdata,
                                 name: 'watts',
                                 lineColor: '#70A4B2',
                                 fillColor: '#9A6759',                             
                                 
                              }],
                              xAxis: {
                                    type: 'datetime',
                                    labels: {
	                                    formatter: function () {
	                                    	var self = this;
	                                    	self.value -= this.chart.options.global.timezoneOffset * 60000;
	                                       var label = this.axis.defaultLabelFormatter.call(self);
													   return label;
												   },
												},
                                },
                                
                                yAxis: {
                                    title: {
                                       text: 'Power in watts'
                                    },                                    
                                },
                              title:{
                                                display:true,
                                                text: 'Power production for ' + ((!!date)?date:'today'),

                                             },
                              plotOptions:{
                                 area: {
                                    fillColor:{
                                       color: "red"},
                                    threshold: null
                                 }
                              }
                           }
                              );
        powerChart.series[0].data = powerdata;
   $.getJSON("all-power.json?serial="+serial+"&date="+date)
    .done (function(result) {
         hideError();
        loadNewPowerData(result);
           
        powerChart.series[0].update({},true);
    })
    .fail (showError);                           
}


function loadNewPowerData(incoming)
{
   $.each(incoming.entries,function()
   {
      var time = new Date(this[0] * 1000)

      var entry = [];
      entry.push(this[0] * 1000);
      entry.push(this[1]);
      powerdata.push(entry);
   });
   
}

function updatePowerChart()
{
    if (date) {
      return;
    }   
    $.getJSON("jeepingben.json")
    .done (function(result) {
         hideError();
         $.each(result.dvcs, function(){
         
            if (this.s === serial)
            {
            addPoint(this.p);
         }
        });
    })
    .fail (showError);
  }

function addPoint(power)
{
   var entry = [];
   var time = new Date();
      entry.push(time.getHours() + ":"+pad(time.getMinutes(),2));
      entry.push(power);
      powerdata.push(entry);
powerChart.series[0].addPoint(entry,true,true);
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

function changeDate()
{
    var newdate=new Date(Date.parse($("#datepicker").val()));
    date=newdate.getFullYear()+""+pad(newdate.getMonth()+1, 2)+""+pad(newdate.getDate(),2);
powerChart.options.title.text= 'Power production for ' + ((!!date)?date:'today');
powerdata=[];
    addPowerChart();
}
$(document).ready(function()
{
  var query = location.search.substr(1);
  var result = {};
  $( "#datepicker" ).datepicker({
     onSelect: changeDate
});
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    if (item[0] === 'serial') {
       serial = item[1];
    }
    if (item[0] === 'date') {
       date = item[1];
    }
  });
    
    addPowerChart();
    hideError();
    setInterval(updatePowerChart,300000); // new data available every 5 minutes
}
);



