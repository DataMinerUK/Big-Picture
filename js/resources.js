function init_resources() {
    update_resources();
}

function openURL(urlink ) {
    $("#tabs").tabs('select', '#tabs-0');
    $("#mainV")[0].src = urlink;
}

function make_main(urlLink) {
    $.ajax({
        url: "setMain.ashx?urlR=WEB;" + urlLink,
        success: function () {
            session.signal();
        }
    });
}

function signalReceivedHandler(event) {
    $.ajax({
        url: "setMain.ashx",
        success: function (data) {
            if (data.split(";")[0] == "WEB") {
                openURL(data.split(";")[1]);
            }
            if (data.split(";")[0] == "UPDATE") {
                update_resources();
            }
            if (data.split(";")[0] == "INVITE") {
                if (session.connection.connectionId == data.split(";")[1]) {
                    $("#dialoginvite").dialog({
                        resizable: false,
                        height: 350,
                        width: 450,
                        buttons: {
                            Ok: function () {
                                $(this).dialog("close");
                                stopPublishing()
                            }
                        }
                    });
                    startPublishingInvite();
                }
            }
        }
    });
}

function update_resources() {
    $.ajax({
        url: "Resources.ashx?room=" + room + "&cmd=list&role=" + role,
        dataType: "json",
        success: function (feed) {
            var html = "";
            $(feed.items).each(function () {
                var item = $(this)[0];
                var currenthtml = "";

                if (item.status == "pending") {
                    currenthtml = "<li class='new' id='" + item.id + "'>" +
                               "<a class='tweet_avatar' href='#' onclick='javascript:openURL(\"" + item.link + "\");'><img src='./temp/" + item.id + ".jpg' width='128' height='96' border='1'/></a>" +
                               "<a href='#' onclick='javascript:openURL(\"" + item.link + "\");'>" + item.title + "</a><br />" +
                               "<span class='tweet_text'>" + item.description + "</span>" +
                               "<p style='text-align: right;'><input type='button' value='Delete' onclick='javascript:delete_resources(\"" + item.id + "\")' />&nbsp;<input type='button' value='Approve' onclick='javascript:approve_resources(\"" + item.id + "\")' />&nbsp;<input type='button' value='Set in main view' onclick='javascript:make_main(\"" + item.link + "\")' /></p>" +
                               "</li>";
                } else {
                    if (role == "admin") {
                        currenthtml = "<li class='new' id='" + item.id + "'>" +
                               "<a class='tweet_avatar' href='#' onclick='javascript:openURL(\"" + item.link + "\");'><img src='./temp/" + item.id + ".jpg' width='128' height='96' border='1'/></a>" +
                               "<a href='#' onclick='javascript:openURL(\"" + item.link + "\");'>" + item.title + "</a><br />" +
                               "<span class='tweet_text'>" + item.description + "</span>" +
                               "<p style='text-align: right;'><input type='button' value='Delete' onclick='javascript:delete_resources(\"" + item.id + "\")' />&nbsp;<input type='button' value='Set in main view' onclick='javascript:make_main(\"" + item.link + "\")' /></p>" +
                               "</li>";
                    } else {
                        currenthtml = "<li class='new' id='" + item.id + "'>" +
                               "<a class='tweet_avatar' href='#' onclick='javascript:openURL(\"" + item.link + "\");'><img src='./temp/" + item.id + ".jpg' width='128' height='96' border='1'/></a>" +
                               "<a href='#' onclick='javascript:openURL(\"" + item.link + "\");'>" + item.title + "</a><br />" +
                               "<span class='tweet_text'>" + item.description + "</span>" +
                               "</li>";
                    };
                };

                if ($("#resourceslist").children('#' + item.id).length == 0) {
                    if (item.title != "") {
                        html = html + currenthtml;
                    };
                } else {
                    if (item.title == "") {
                        $("#resourceslist").children('#' + item.id).remove();
                    } else {
                        $("#resourceslist").children('#' + item.id).html(currenthtml);
                    };
                };
            });

            $("#resourceslist").append(html);
            $("#resourceslist").children().removeClass('tweet_even');
            $("#resourceslist").children().removeClass('tweet_odd');
            $("#resourceslist").children('li:odd').addClass('tweet_even');
            $("#resourceslist").children('li:even').addClass('tweet_odd');
            $("input:button").button();
        }
    });
    
}

function loop_update_resources() {
    update_resources();
    setTimeout("loop_update_resources();", 15000);
}

function suggest_resource() {
    $("#title")[0].value = "";
    $("#description")[0].value = "";
    $("#urlR")[0].value = "";
    
    $("#dialog").dialog({
        resizable: false,
        width: 500,
        buttons: {
            Ok: function () {
                $.ajax({
                    url: "Resources.ashx?room=" + room + "&cmd=add&title=" + $("#title")[0].value + "&description=" + $("#description")[0].value + "&urlR=" + $("#urlR")[0].value + "&role=" + role,
                    success: function () {
                        $("#okdialog").dialog({
                            resizable: false,
                            buttons: {                                
                                Ok: function () {
                                    $(this).dialog("close");
                                    $.ajax({
                                        url: "setMain.ashx?urlR=UPDATE;",
                                        success: function () {
                                            session.signal();
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}


function delete_resources(id) {
    $.ajax({
        url: "Resources.ashx?room=" + room + "&cmd=delete&id=" + id + "&role=" + role,
        success: function () {
            $("#resourceslist").children('#' + id).remove();
            $.ajax({
                url: "setMain.ashx?urlR=UPDATE;",
                success: function () {
                    session.signal();
                }
            });
        }
    });
}

function approve_resources(id) {
    $.ajax({
        url: "Resources.ashx?room=" + room + "&cmd=approve&id=" + id + "&role=" + role,
        success: function () {
            $("#resourceslist").children('#' + id).remove();
            $.ajax({
                url: "setMain.ashx?urlR=UPDATE;",
                success: function () {
                    session.signal();
                }
            });
        }
    });
}
