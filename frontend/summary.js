$(document).ready(function() {
    hideError();
    addHighscores();
    markScoresLoading();
    updateScores();
    markDevicesLoading();
    updateDevices();
    updateScores();
    setInterval(updateDevices, 30000);
    setInterval(updateScores, 180000);
});

function updateDevices() {
    $.getJSON("jeepingben.json")
    .done (function(result) {
    	  hideError();
        loadNewData(result);
    })
    .fail (showError);
    
}

function markAndUpdateDevices()
{
	markDevicesLoading();
	updateDevices();
}

function loadNewData(powerData) {
    $.each(powerData.dvcs, function() {
        if ($("#" + this.s).length === 0) {
            addDevice(this.s, this.t);
        }
        overrideStatus(this);
        $("#" + this.s + "inverterStatus").text(this.st);
        switch( this.sc)
        {
        	case "Good":
        		$("#" + this.s + "inverterStatus").css('color', 'green');
        		break;
        	case "Neutral":
        		$("#" + this.s + "inverterStatus").css('color', 'grey');
        		break;
        	case "Bad":
        		$("#" + this.s + "inverterStatus").css('color', 'red');
        		break;
        }
        $("#" + this.s + "powerNow").text(this.p + "W");
        $("#" + this.s + "inverterTotal").text((this.et / 1000.0).toFixed(1) + "Kwh");
        $("#" + this.s + "powerToday").text((this.ed / 1000.0).toFixed(1) + "Kwh");
		  $("#" + this.s).removeClass("loading");
    });
}

function overrideStatus(device)
{
	// If data is stale, tell the user the device is offline
	var lastupdate = new Date(Date(device.up));
	var now = new Date();
	var diff = now.getTime() - lastupdate.getTime();
	if (now.getTime() - lastupdate.getTime() > 600 * 1000) //10 minutes
	{
		device.st = "Offline";
		device.sc = "Bad";
	}
}

function updateScores() {
	
    $.getJSON("high-scores.json")
    .done (function(result) {
    	  hideError();
        loadHighScores(result);
    })
    .fail (showError);
    	
}

function showError()
{
	$("#errormessage").show();
}
function hideError()
{
	$("#errormessage").hide();
}

function markDevicesLoading()
{
	$.each($(".rebusitem"), function(){
		$(this).addClass("loading");});
}
function markScoresLoading()
{
	$("#maxPower").addClass("loading");
	$("#topDays").addClass("loading");
}

function loadHighScores(scores) {

    $("#maxPower").empty();
    $.each(scores.best_output, function() {
        $("<div><span>" + this[0] + " " + this[1] + "W</span></div>").appendTo("#maxPower");
    });
	 $("#maxPower").removeClass("loading");
    $("#topDays").empty();
    $.each(scores.best_days, function() {
        $("<div><span>" + this[0] + " " + (this[1] / 1000.0).toFixed(1) + "Kwh</span></div>").appendTo("#topDays");
    });
    $("#topDays").removeClass("loading");
}


function addDevice(serial, deviceType) {

    $("<br><div id=" + serial + " class='rebusitem card '><span class='card-header'>" + deviceType + " " + serial + "</span>" +
        "<div id='" + serial + "deviceBody' class='card-block'>" +
        "<img id='" + serial + "Icon' class='float-right deviceIcon img-fluid' onclick='markAndUpdateDevices()'></img>" +
        "Status: <div class='devicefield' id=" + serial + "inverterStatus></div>" +
        "<div>Power: <span class='devicefield' id=" + serial + "powerNow></span></div>" +
        "<div>Total Energy Captured: <span class='deviceField' id=" + serial + "inverterTotal></span></div>" +
        "</div>").appendTo("#devices");

    if (deviceType.indexOf("Inverter") !== -1) {
        $("#" + serial).addClass("card-info");
        $("#" + serial + "Icon").attr('src', 'inverter.png');
        $("<div>Energy Captured Today: <span class='devicefield' id=" + serial + "powerToday></span></div>").appendTo("#" + serial + "deviceBody");
    } else {
        $("#" + serial).addClass("card-success");
        $("#" + serial + "Icon").attr('src', 'panels.png');
    }
}

function addHighscores() {

    $("<br><div id=highscorescard class='highscores card card-danger'><span class='card-header'>Highest Production Days</span>" +
        "<div class='card-block' id=topDays></div>" +
        "<span class='card-header'>Highest Power Output</span>" +
        "<div class='card-block' id=maxPower></div>" +
        "</div>").appendTo("#highscores");

}
