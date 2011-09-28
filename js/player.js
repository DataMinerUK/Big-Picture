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

function init_video() {
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
        session.addEventListener('archiveLoaded', archiveLoadedHandler);

        connect();
    };

}

function connect() {
    session.connect(apiKey, token);
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
        var parentDiv = document.getElementById("myCamera");
        var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
        publisherDiv.setAttribute('id', 'opentok_publisher');
        parentDiv.appendChild(publisherDiv);
        publisher = session.publish(publisherDiv.id); // Pass the replacement div id to the publish method
        show('unpublishLink');
        hide('publishLink');
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

function archiveLoadedHandler(event) {
    //session.addEventListener('playbackStopped', playbackStoppedHandler);
    session.addEventListener('streamCreated', streamCreatedHandler);
    archive = event.archives[0];
    archive.startPlayback();
}

function sessionConnectedHandler(event) {
    //session.createArchive(apiKey, 'perSession');
    session.loadArchive(archiveIDD);

    for (var j = 0; j < event.connections.length; j++) {
        var currenthtml = "<li id='" + event.connections[j].connectionId + "'>" +
                               event.connections[j].connectionId + "<br />" +
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
    alert("Archive created. " + archiveId);
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
        return;
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
    archive = { archiveId: '8658037c-81d8-4740-a9c0-284535e27fae' };

    session.stopRecording(archive);
    $('#titleH').html("Big Picture: " + archive.archiveId);
    archive = null;

    show('recordLink');
    hide('stopLink');
}

function sessionRecordingStoppedHandler(event) {
    session.addEventListener("archiveClosed", archiveClosedHandler);

    alert('ok');
}

function record_video() {
    hide('recordLink');
    show('stopLink');

    archive = { archiveId: '8658037c-81d8-4740-a9c0-284535e27fae' };
    session.startRecording(archive); 
}

function request_video(id) {

}

function disconnect_video(id) {
    for (var i = 0; i < streamsList.length; i++) {
        if (streamsList[i].connection.connectionId == id) {
            session.forceUnpublish(streamsList[i]);
        };
    };
}