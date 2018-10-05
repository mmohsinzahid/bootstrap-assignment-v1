var dom_frm_new_msg = $("#frm_new_msg");
var dom_send_loc = $('#send-loc');
var dom_new_msg = $("#newMsg");
var dom_msg_input = $("[name=n_msg]");
var dom_msg_sent = $('#msg-sent');
var dom_join_notice = $('#join-notice');
var dom_login = $('#login');
var dom_users = $('#users');

var dom_join_room = $('#join-room');
var dom_from_join_room = $('#form-join-room');
var dom_chat = $('#chat');
var dom_welcome = $('#welcome');

var cookie_u = getCookie('u');
var cookie_room = getCookie('room');

var socket = io();

if(cookie_u != null && cookie_room != null){
    funcJoinRoom(socket,cookie_u,cookie_room,false);
}

socket.on('connect', function() {
    
});

socket.on('disconnect', function() {
    
});

socket.on('newMsg',function(objMSg){
    addMsg(objMSg);     
});

socket.on('showUser',function(objMSg){
    addMsg(objMSg);     
});

socket.on('newUser', function(objMSg){
    addMsg(objMSg);
});

socket.on('userList',function(users){
    dom_users.html('');
    if(cookie_u === undefined)
        cookie_u = getCookie('u');
   
    $.each(users,function(index,value){
        var node = $("<div><div>");
        
        buttons_div = `<div><input type='button' value='Block'>&nbsp;<input type='button' value='PM' onclick="funcDisplayPM('${value}')"></div>`;
        if(cookie_u == value)
            buttons_div = "";
        node.html(value + buttons_div).attr('data-name',value);
        dom_users.append(node);
    });
});


dom_frm_new_msg.on("submit",function(e){
   
    var msgVal = dom_msg_input.val();
    if(msgVal == ""){
        dom_msg_sent.html('Please enter message');
        return false;
    }
    if(cookie_u === undefined)
        cookie_u = getCookie('u');
    var today = new Date();
    today = today.toString().substring(4,21);
    var msgObj = {from:cookie_u,text:msgVal,createdAt:today};
    addMsg(msgObj);
    socket.emit('createMsg',
        {text:msgVal},
        function(str){
            dom_msg_input.val('');
            dom_msg_sent.html(str);
        }
    );

    return false;
});

dom_send_loc.on('click',function(){
    if(navigator.geolocation){
        dom_send_loc_value = dom_send_loc.html();
        dom_send_loc.attr('disabled','disabled').html('Loading...');
        navigator.geolocation.getCurrentPosition(function(corr){
            socket.emit('sendGeoLoc',{lat:corr.coords.latitude,lng:corr.coords.longitude});
            dom_send_loc.removeAttr('disabled').html(dom_send_loc_value);
        },function(){
            alert('You rejected to get location');
            dom_send_loc.removeAttr('disabled').html(dom_send_loc_value);
        });
    }
    else{
        alert('Unable to access Geo location from your browser');
    }
});

function addMsg(objMsg){
    var node = $("<li></li>");
    node.html(`<b>${objMsg.from}:</b> ${objMsg.text} Time: ${objMsg.createdAt}`);
    dom_new_msg.append(node);
}


dom_from_join_room.on('submit',function(e){
    
    var name = $("#txt_name").val();
    var room = $("#sl_room").val();
    var err = "";
    if($.trim(name) == "")
        err += "Please enter User Name<br />";
    if($.trim(room) == "")
        err += "Please select Room <br />";
    if(err != ""){
        dom_join_notice.html(err);
    }
    else{
        funcJoinRoom(socket,name,room);    
    }
    

    return false;
});

function funcJoinRoom(socket,name,room,newJoin = true){
    socket.emit('joinRoom',{name:name,room:room,newJoin:newJoin},function(res){
        if(res.status == 'error'){
            dom_join_notice.html(res.msg);
        } else {
            funcSetCookie('u',name,{minutes:0}),
            funcSetCookie('room',room,{minutes:0}),
            dom_welcome.html(res.msg);
            dom_login.hide();
            dom_chat.show();
        }
    });
}

function funcSetCookie(name,value,expire={days:0,minutes:30}) {
    var date = new Date();
    if(expire.days > 0)
        expire.days = expire.days * 24;
	date.setTime(date.getTime() + (expire.days * expire.minutes * 60 * 1000));
	var expires = ";expires=" + date.toUTCString();
	document.cookie = name+"="+value  + expires + ";domain=" + document.domain +";path=/";
}

function getCookie(name) 
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function funcDisplayPM(name){
    $('#div_pm').remove();
    var div_pm = $(`<div id='div_pm'><input id="pm" /><input type="button" value="Send" onclick="funcSendPM('${name}')" /><input type="button" value="Close"  onclick="$('#div_pm').remove()"/></div>`);
    $('div [data-name='+name+'] div').prepend(div_pm);
}

function funcSendPM(name){
    socket.emit('pm',{name:name,text:$('#pm').val()},function(res){
        if(res.status == 'success'){
            $('#div_pm').remove();
        }
        dom_msg_sent.html(res.msg);
    });
}