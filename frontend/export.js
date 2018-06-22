var serial = "";
var date = "";
var exportdata = [];
var gendata = [];
var housedata = [];
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
                 type:    'area'
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
                  colors: [
                '#fA6759',
                                '#9A6759',
                               '#4A6759'
], 
                              series:  [{
                                 type: 'area',
                                 data: housedata,
                                 name: 'using watts',
                 fillOpacity: 0.4,
                 marker: {
                    enabled: false
                 }, 
                              },
                              {
                                 type: 'area',
                                 data: gendata,
                                 name: 'generating watts',
                 marker: {
                    enabled: false
                 }, 
                 fillOpacity: 0.4,
                                 
                              },
                              {
                                 type: 'area',
                                 data: exportdata,
                                 name: 'exporting/importing watts',
                 marker: {
                    enabled: false
                 }, 
                                 
                 fillOpacity: 0.4,
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
                                    startOnTick: false,
                                    title: {
                                       text: 'Watts'
                                    },                                    
                                },
                              title:{
                                                display:true,
                                                text: 'Power consumption for ' + ((!!date)?date:'today'),

                                             },
                              plotOptions:{
                series: {
                fillOpacity: 0.4
                },
                }
                           }
                              );
   $.getJSON("export.json?serial="+serial+"&date="+date)
    .done (function(result) {
         hideError();
        loadNewPowerData(result);
           
        powerChart.series[0].update({},true);
        powerChart.series[1].update({},true);
        powerChart.series[2].update({},true);
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
      exportdata.push(entry);
      entry = [];
      entry.push(this[0] * 1000);
      entry.push(this[2]);
      gendata.push(entry);
      entry = [];
      entry.push(this[0] * 1000);
      entry.push(this[3]);
      housedata.push(entry);
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
    housedata=[];
    exportdata=[];
    gendata=[];
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
}
);



