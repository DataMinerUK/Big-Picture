function init_resources() {
    loop_update_resources();    
}

function openURL(urlink ) {
    $("#tabs").tabs('select', '#tabs-0');
    $("#mainV")[0].src = urlink;
}

function update_resources() {
     $.ajax({
        url: "http://pipes.yahoo.com/pipes/pipe.run?_id=2c07ef10e470d2641c57d0e492121db5&_render=json&role=" + role + "&room=" + room,
        dataType: 'json',
        //url: "http://184.72.38.228/MoJo/Resources.ashx?room=" + room + "&cmd=list&role=" + role,
        success: function (feed) {
            var html = "";
            $(feed.value.items).each(function () {
                var item = $(this)[0];
                var currenthtml = "";

                if (item.updated == "") {
                    currenthtml = "<li class='new' id='" + item.id + "'>" +
                               "<a class='tweet_avatar' href='#' onclick='javascript:openURL(\"" + item.link + "\");'><img src='./temp/" + item.id + ".jpg' width='128' height='96' border='1'/></a>" +
                               "<a href='#' onclick='javascript:openURL(\"" + item.link + "\");'>" + item.title + "</a><br />" +
                               "<span class='tweet_text'>" + item.description + "</span>" +
                               "<p style='text-align: right;'><input type='button' value='Delete' onclick='javascript:delete_resources(\"" + item.id + "\")' />&nbsp;<input type='button' value='Approve' onclick='javascript:approve_resources(\"" + item.id + "\")' />&nbsp;<input type='button' value='Set in main view' onclick='javascript:main_resources(\"" + item.link + "\")' /></p>" +
                               "</li>";
                } else {
                    if (role == "admin") {
                        currenthtml = "<li class='new' id='" + item.id + "'>" +
                               "<a class='tweet_avatar' href='#' onclick='javascript:openURL(\"" + item.link + "\");'><img src='./temp/" + item.id + ".jpg' width='128' height='96' border='1'/></a>" +
                               "<a href='#' onclick='javascript:openURL(\"" + item.link + "\");'>" + item.title + "</a><br />" +
                               "<span class='tweet_text'>" + item.description + "</span>" +
                               "<p style='text-align: right;'><input type='button' value='Delete' onclick='javascript:delete_resources(\"" + item.id + "\")' />&nbsp;<input type='button' value='Set in main view' onclick='javascript:main_resources(\"" + item.link + "\")' /></p>" +
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
                    url: "http://184.72.38.228/MoJo/Resources.ashx?room=" + room + "&cmd=add&title=" + $("#title")[0].value + "&description=" + $("#description")[0].value + "&urlR=" + $("#urlR")[0].value + "&role=" + role,
                    success: function () {
                        $("#okdialog").dialog({
                            resizable: false,
                            buttons: {                                
                                Ok: function () {
                                    $(this).dialog("close");                                    
                                    update_resources();
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

function main_resources(urlink){
    session.signal();
}

function delete_resources(id) {
    $.ajax({
        url: "http://184.72.38.228/MoJo/Resources.ashx?room=" + room + "&cmd=delete&id=" + id + "&role=" + role,
        success: function () {
            $("#resourceslist").children('#' + id).remove();
            update_resources();
        }
    });
}

function approve_resources(id) {
    $.ajax({
        url: "http://184.72.38.228/MoJo/Resources.ashx?room=" + room + "&cmd=approve&id=" + id + "&role=" + role,
        success: function () {
            $("#resourceslist").children('#' + id).remove();
            update_resources();
        }
    });
}
