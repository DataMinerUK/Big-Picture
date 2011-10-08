var apiKey = 2578892;
var sessionId = '2_MX4wfn4yMDExLTA5LTE1IDE0OjQ3OjAxLjgwNzk1NSswMDowMH4wLjM2NjMyODgxNDEyM34';
var token = 'moderator_token';

var session;
var archive;
var publisher;
var subscribers = {};
var streamsList = new Array();
var deviceManager;
var devicePanel;
var panelShowing = false;

function init_video(){
    $("#videoStatus").html("Status: Not connected.");
    show('connectLink');
    hide('disconnectLink');
    hide('publishLink');
    hide('unpublishLink');
    hide('recordLink');
    hide('stopLink');
        
    if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
        alert('Minimum System Requirements not met!');
    } else {

        session = TB.initSession(sessionId);
        session.addEventListener('sessionConnected', sessionConnectedHandler);
        session.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
        session.addEventListener('connectionCreated', connectionCreatedHandler);
        session.addEventListener('connectionDestroyed', connectionDestroyedHandler);
        session.addEventListener('streamCreated', streamCreatedHandler);
        session.addEventListener('streamDestroyed', streamDestroyedHandler);
        session.addEventListener("signalReceived", signalReceivedHandler);

        session.addEventListener('sessionRecordingStopped', sessionRecordingStoppedHandler);
        session.addEventListener('archiveCreated', archiveCreatedHandler);

        connect();
    };

}

function connect() {
    var sessionConnectProperties = { connectionData: username };
    session.connect(apiKey, token, sessionConnectProperties);
}

function disconnect() {
    session.disconnect();
    hide('recordLink');
    hide('stopLink');
    hide('disconnectLink');
    hide('publishLink');
    hide('unpublishLink');
}

// Called when user wants to start publishing to the session


function startPublishing() {
    if (!publisher) {
        var parentDiv = document.getElementById("myCameraINV");
        var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
        publisherDiv.setAttribute('id', 'opentok_publisher');
        parentDiv.appendChild(publisherDiv);
        publisher = session.publish(publisherDiv.id); // Pass the replacement div id to the publish method
        show('unpublishLink');
        hide('publishLink');
    }
}

function startPublishingINT(){
    $("#dialoginvite").dialog({
        resizable: false,
        height: 350,
        width: 450,
        buttons: {
            'Stop': function () {
                $(this).dialog("close");
                stopPublishing()
            }
        }
    });
    startPublishing();
}

function startPublishingInvite() {
    if (!publisher) {
        var parentDiv = document.getElementById("myCameraINV");
        var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
        publisherDiv.setAttribute('id', 'opentok_publisher');
        parentDiv.appendChild(publisherDiv);
        publisher = session.publish(publisherDiv.id); // Pass the replacement div id to the publish method
    }
}

function stopPublishing() {
    if (publisher) {
        session.unpublish(publisher);
    }
    publisher = null;

    show('publishLink');
    hide('unpublishLink');
}

function sessionConnectedHandler(event) {
    for (var j = 0; j < event.connections.length; j++) {
        var currenthtml = "<li id='" + event.connections[j].connectionId + "'>" +
                               event.connections[j].data + "<br />" +
                               "<p style='text-align: right;'><input type='button' value='Request video' onclick='javascript:request_video(\"" + event.connections[j].connectionId + "\")' />&nbsp;<input type='button' value='Disconnect Video' onclick='javascript:disconnect_video(\"" + event.connections[j].connectionId + "\")' /></p>" +
                                "</li>";
        $("#userslist").append(currenthtml);

        $("#userslist").children().removeClass('tweet_even');
        $("#userslist").children().removeClass('tweet_odd');
        $("#userslist").children('li:odd').addClass('tweet_even');
        $("#userslist").children('li:even').addClass('tweet_odd');
        $("input:button").button();
    };

    // Subscribe to all streams currently in the Session
    for (var i = 0; i < event.streams.length; i++) {
        addStream(event.streams[i]);
    }

    $("#videoStatus").html("Status: Connected.");
    show('disconnectLink');
    show('publishLink');
    show('recordLink');
    hide('connectLink');
    hide('unpublishLink');
}

function archiveCreatedHandler(event) {
    archive = event.archives[0];
    archiveId = archive.archiveId;

    session.startRecording(archive);

}

function streamCreatedHandler(event) {
    // Subscribe to the newly created streams
    for (var i = 0; i < event.streams.length; i++) {
        addStream(event.streams[i]);
    }
}

function streamDestroyedHandler(event) {
    // This signals that a stream was destroyed. Any Subscribers will automatically be removed.
    // This default behaviour can be prevented using event.preventDefault()
    /*
    for (var i = 0; i < event.connections.length; i++) {
        $("#userslist").children('#' + event.connections[i].connectionId).remove();

        $("#userslist").children().removeClass('tweet_even');
        $("#userslist").children().removeClass('tweet_odd');
        $("#userslist").children('li:odd').addClass('tweet_even');
        $("#userslist").children('li:even').addClass('tweet_odd');
    };
    */
}

function sessionDisconnectedHandler(event) {
    // This signals that the user was disconnected from the Session. Any subscribers and publishers
    // will automatically be removed. This default behaviour can be prevented using event.preventDefault()
    publisher = null;

    $("#videoStatus").html("Status: Not connected.");
    show('connectLink');
    hide('disconnectLink');
    hide('publishLink');
    hide('unpublishLink');
    hide('recordLink');
}

function connectionDestroyedHandler(event) {
    // This signals that connections were destroyed
}

function connectionCreatedHandler(event) {
    // This signals new connections have been created.
}

/*
If you un-comment the call to TB.addEventListener("exception", exceptionHandler) above, OpenTok calls the
exceptionHandler() method when exception events occur. You can modify this method to further process exception events.
If you un-comment the call to TB.setLogLevel(), above, OpenTok automatically displays exception event messages.
*/
function exceptionHandler(event) {
    alert("Exception: " + event.code + "::" + event.message);
}


function addStream(stream) {
    // Check if this is the stream that I am publishing, and if so do not publish.
    if (stream.connection.connectionId == session.connection.connectionId) {
        //return;
    }
    var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
    //subscriberDiv.style.MozTransform = 'rotate(15deg)';
    subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
    document.getElementById("subscribers").appendChild(subscriberDiv);

    var subscriberProps = { width: 120,
        height: 90,
        subscribeToAudio: true
    };

    subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id);
    streamsList.push(stream);
}

function show(id) {
    $('#' + id).show();
}

function hide(id) {
    $('#' + id).hide();
}

function signal() {
    session.signal();
}

function toggleDevicePanel() {
    if (panelShowing) {
        if (devicePanel) {
            deviceManager.removePanel(devicePanel);
        }
        document.getElementById("toggleDevicePanelLink").value = 'Camera Settings';
        hide("devicePanelContainer");
        panelShowing = false;
    } else {
        var newdiv = document.createElement("div");
        newdiv.id = "devicePanel";
        document.getElementById("devicePanelInset").appendChild(newdiv);
        if (deviceManager == null) {
            deviceManager = TB.initDeviceManager(apiKey);
        }
        devicePanel = deviceManager.displayPanel("devicePanel", publisher, { "showCloseButton": false });
        document.getElementById("toggleDevicePanelLink").value = 'Hide Camera Settings';
        show("devicePanelContainer");
        panelShowing = true;
    }
}

function stop_video() {
    session.stopRecording(archive);
    session.closeArchive(archive);
    $('#recordStatus').html("Recording ID: " + archive.archiveId + "<br /><a href='player.htm?room=" + room + "&role=guest&topic=" + twitterQuery + "&username=" + username + "&code=" + archive.archiveId + "'>Link</a>");

    show('recordLink');
    hide('stopLink');
}

function sessionRecordingStoppedHandler(event) {
    session.addEventListener("archiveClosed", archiveClosedHandler);
}

function record_video() {
    hide('recordLink');
    show('stopLink');

    //archive = { archiveId: '522dcfa0-ddf4-446c-b9ee-89c06f3264fc' };
    //session.startRecording(archive);

    archive = session.createArchive(apiKey, 'perSession');
}

function request_video(id) {
    $.ajax({
        url: endpoint + "setMain.ashx?urlR=INVITE;" + id,
        dataType: 'jsonp',
        success: function () {
            session.signal();
        }
    });
}

function disconnect_video(id) {
    for (var i = 0; i < streamsList.length; i++) {
        if (streamsList[i].connection.connectionId == id) {
            session.forceUnpublish(streamsList[i]);
        };
    };
}