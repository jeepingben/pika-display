
var serial = "";
var date = "";
var powerdata = {};
var powerChart = {};
powerdata.datasets=[];
powerdata.labels=[];
powerdata.datasets[0]={};

powerdata.datasets[0].backgroundColor = "#9A6759";
powerdata.datasets[0].borderColor = "#70A4B2";


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
                                                   text: 'Power production for ' + ((!!date)?date:'today'),
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
    $.getJSON("all-power.json?serial="+serial+"&date="+date)
    .done (function(result) {
          hideError();
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
        
        powerdata.datasets[0].data.push((this[1]));
    }),powerChart.update();
    
}

function updatePowerChart()
{
    if(date) {
        hideError();
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
    var time = new Date();
    powerdata.labels.push(time.getHours() + ":"+pad(time.getMinutes(),2));
    powerdata.datasets[0].data.push(power);
    powerChart.update();
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
powerdata.labels=[];
powerChart.options.title.text= 'Power production for ' + ((!!date)?date:'today');
powerdata.datasets[0].data=[];
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
    powerdata.datasets[0].label = serial;
    addPowerChart();
    hideError();
    setInterval(updatePowerChart,300000); // new data available every 5 minutes
}
);
