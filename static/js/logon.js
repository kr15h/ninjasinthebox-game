// NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23


function getLocalIP() {

    var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    var ipAddr;

    if (RTCPeerConnection) (function () {
	var rtc = new RTCPeerConnection({iceServers:[]});
	if (1 || window.mozRTCPeerConnection) {      // FF [and now Chrome!] needs a channel/stream to proceed
            rtc.createDataChannel('', {reliable:false});
	};
    
	rtc.onicecandidate = function (evt) {
            // convert the candidate to SDP so we can run it through our general parser
            // see https://twitter.com/lancestout/status/525796175425720320 for details
            if (evt.candidate) ipAddr = grepSDP("a="+evt.candidate.candidate);
	};
    
	rtc.createOffer(function (offerDesc) {
            ipAddr = grepSDP(offerDesc.sdp);
            rtc.setLocalDescription(offerDesc);
	}, function (e) { console.warn("offer failed", e); });
    
	function grepSDP(sdp) {
            var hosts = [];
            sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
		if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                    var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                    addr = parts[4],
                    type = parts[7];
                    if (type === 'host') return(addr);
		} else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                    var parts = line.split(' '),
                    addr = parts[2];
                    return(addr);
		}
            });
	}
    })();
    
    return ipAddr;
}
