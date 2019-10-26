(function(send) {
    XMLHttpRequest.prototype.send = function(body) {
        var info="send data\r\n"+body;
        alert(info);
        send.call(this, body);
    };
})(XMLHttpRequest.prototype.send);