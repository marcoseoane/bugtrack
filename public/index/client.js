(function(send) {
    console.log('tripped1')
    XMLHttpRequest.prototype.send = function(data) {
        console.log('tripped')
        send.call(this, data);
    };

})(XMLHttpRequest.prototype.send);