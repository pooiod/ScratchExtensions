// Name: FilePile
// ID: P7FilePile
// Description: Easy file sharing and distribution extension using MQTT.
// By: pooiod7 <https://scratch.mit.edu/users/pooiod7/>
// Builds: dev
// Unsandboxed: true
// WIP: false
// Created: Nov 3, 2025
// Docs: /docs/#/FilePile
// Notes: Uses wss://broker.emqx.io:8084/mqtt and paho-mqtt/1.0.1/mqttws31.min.js for communication.

(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    async function waitForPaho() {
        if (typeof Paho !== 'undefined') return;

        // if (!document.querySelector('script[src*="mqttws31.min.js"]')) {
        //     const script = document.createElement('script');
        //     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js';
        //     document.head.appendChild(script);
        // }

        // for (let i = 0; i < 100; i++) {
        //     if (typeof Paho !== 'undefined') return;
        //     await new Promise(r => setTimeout(r, 100));
        // }

        // Paho MQTT   Copyright (c) 2013, 2014 IBM Corp.
        // Uses the Eclipse Public License v1.0 and Eclipse Distribution License v1.0 (http://www.eclipse.org/legal/epl-v10.html http://www.eclipse.org/org/documents/edl-v10.php)
        "undefined"===typeof Paho&&(Paho={});
        Paho.MQTT=function(u){function y(a,b,c){b[c++]=a>>8;b[c++]=a%256;return c}function r(a,b,c,h){h=y(b,c,h);F(a,c,h);return h+b}function m(a){for(var b=0,c=0;c<a.length;c++){var h=a.charCodeAt(c);2047<h?(55296<=h&&56319>=h&&(c++,b++),b+=3):127<h?b+=2:b++}return b}function F(a,b,c){for(var h=0;h<a.length;h++){var e=a.charCodeAt(h);if(55296<=e&&56319>=e){var d=a.charCodeAt(++h);if(isNaN(d))throw Error(f(g.MALFORMED_UNICODE,[e,d]));e=(e-55296<<10)+(d-56320)+65536}127>=e?b[c++]=e:(2047>=e?b[c++]=e>>6&31|
        192:(65535>=e?b[c++]=e>>12&15|224:(b[c++]=e>>18&7|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}function G(a,b,c){for(var h="",e,d=b;d<b+c;){e=a[d++];if(!(128>e)){var p=a[d++]-128;if(0>p)throw Error(f(g.MALFORMED_UTF,[e.toString(16),p.toString(16),""]));if(224>e)e=64*(e-192)+p;else{var t=a[d++]-128;if(0>t)throw Error(f(g.MALFORMED_UTF,[e.toString(16),p.toString(16),t.toString(16)]));if(240>e)e=4096*(e-224)+64*p+t;else{var l=a[d++]-128;if(0>l)throw Error(f(g.MALFORMED_UTF,
        [e.toString(16),p.toString(16),t.toString(16),l.toString(16)]));if(248>e)e=262144*(e-240)+4096*p+64*t+l;else throw Error(f(g.MALFORMED_UTF,[e.toString(16),p.toString(16),t.toString(16),l.toString(16)]));}}}65535<e&&(e-=65536,h+=String.fromCharCode(55296+(e>>10)),e=56320+(e&1023));h+=String.fromCharCode(e)}return h}var A=function(a,b){for(var c in a)if(a.hasOwnProperty(c))if(b.hasOwnProperty(c)){if(typeof a[c]!==b[c])throw Error(f(g.INVALID_TYPE,[typeof a[c],c]));}else{var h="Unknown property, "+c+
        ". Valid properties are:";for(c in b)b.hasOwnProperty(c)&&(h=h+" "+c);throw Error(h);}},q=function(a,b){return function(){return a.apply(b,arguments)}},g={OK:{code:0,text:"AMQJSC0000I OK."},CONNECT_TIMEOUT:{code:1,text:"AMQJSC0001E Connect timed out."},SUBSCRIBE_TIMEOUT:{code:2,text:"AMQJS0002E Subscribe timed out."},UNSUBSCRIBE_TIMEOUT:{code:3,text:"AMQJS0003E Unsubscribe timed out."},PING_TIMEOUT:{code:4,text:"AMQJS0004E Ping timed out."},INTERNAL_ERROR:{code:5,text:"AMQJS0005E Internal error. Error Message: {0}, Stack trace: {1}"},
        CONNACK_RETURNCODE:{code:6,text:"AMQJS0006E Bad Connack return code:{0} {1}."},SOCKET_ERROR:{code:7,text:"AMQJS0007E Socket error:{0}."},SOCKET_CLOSE:{code:8,text:"AMQJS0008I Socket closed."},MALFORMED_UTF:{code:9,text:"AMQJS0009E Malformed UTF data:{0} {1} {2}."},UNSUPPORTED:{code:10,text:"AMQJS0010E {0} is not supported by this browser."},INVALID_STATE:{code:11,text:"AMQJS0011E Invalid state {0}."},INVALID_TYPE:{code:12,text:"AMQJS0012E Invalid type {0} for {1}."},INVALID_ARGUMENT:{code:13,text:"AMQJS0013E Invalid argument {0} for {1}."},
        UNSUPPORTED_OPERATION:{code:14,text:"AMQJS0014E Unsupported operation."},INVALID_STORED_DATA:{code:15,text:"AMQJS0015E Invalid data in local storage key={0} value={1}."},INVALID_MQTT_MESSAGE_TYPE:{code:16,text:"AMQJS0016E Invalid MQTT message type {0}."},MALFORMED_UNICODE:{code:17,text:"AMQJS0017E Malformed Unicode string:{0} {1}."}},J={0:"Connection Accepted",1:"Connection Refused: unacceptable protocol version",2:"Connection Refused: identifier rejected",3:"Connection Refused: server unavailable",
        4:"Connection Refused: bad user name or password",5:"Connection Refused: not authorized"},f=function(a,b){var c=a.text;if(b)for(var h,e,d=0;d<b.length;d++)if(h="{"+d+"}",e=c.indexOf(h),0<e)var g=c.substring(0,e),c=c.substring(e+h.length),c=g+b[d]+c;return c},B=[0,6,77,81,73,115,100,112,3],C=[0,4,77,81,84,84,4],n=function(a,b){this.type=a;for(var c in b)b.hasOwnProperty(c)&&(this[c]=b[c])};n.prototype.encode=function(){var a=(this.type&15)<<4,b=0,c=[],h=0;void 0!=this.messageIdentifier&&(b+=2);switch(this.type){case 1:switch(this.mqttVersion){case 3:b+=
        B.length+3;break;case 4:b+=C.length+3}b+=m(this.clientId)+2;if(void 0!=this.willMessage){var b=b+(m(this.willMessage.destinationName)+2),e=this.willMessage.payloadBytes;e instanceof Uint8Array||(e=new Uint8Array(g));b+=e.byteLength+2}void 0!=this.userName&&(b+=m(this.userName)+2);void 0!=this.password&&(b+=m(this.password)+2);break;case 8:for(var a=a|2,d=0;d<this.topics.length;d++)c[d]=m(this.topics[d]),b+=c[d]+2;b+=this.requestedQos.length;break;case 10:a|=2;for(d=0;d<this.topics.length;d++)c[d]=
        m(this.topics[d]),b+=c[d]+2;break;case 6:a|=2;break;case 3:this.payloadMessage.duplicate&&(a|=8);a=a|=this.payloadMessage.qos<<1;this.payloadMessage.retained&&(a|=1);var h=m(this.payloadMessage.destinationName),g=this.payloadMessage.payloadBytes,b=b+(h+2)+g.byteLength;g instanceof ArrayBuffer?g=new Uint8Array(g):g instanceof Uint8Array||(g=new Uint8Array(g.buffer))}var f=b,d=Array(1),l=0;do{var z=f%128,f=f>>7;0<f&&(z|=128);d[l++]=z}while(0<f&&4>l);f=d.length+1;b=new ArrayBuffer(b+f);l=new Uint8Array(b);
        l[0]=a;l.set(d,1);if(3==this.type)f=r(this.payloadMessage.destinationName,h,l,f);else if(1==this.type){switch(this.mqttVersion){case 3:l.set(B,f);f+=B.length;break;case 4:l.set(C,f),f+=C.length}a=0;this.cleanSession&&(a=2);void 0!=this.willMessage&&(a=a|4|this.willMessage.qos<<3,this.willMessage.retained&&(a|=32));void 0!=this.userName&&(a|=128);void 0!=this.password&&(a|=64);l[f++]=a;f=y(this.keepAliveInterval,l,f)}void 0!=this.messageIdentifier&&(f=y(this.messageIdentifier,l,f));switch(this.type){case 1:f=
        r(this.clientId,m(this.clientId),l,f);void 0!=this.willMessage&&(f=r(this.willMessage.destinationName,m(this.willMessage.destinationName),l,f),f=y(e.byteLength,l,f),l.set(e,f),f+=e.byteLength);void 0!=this.userName&&(f=r(this.userName,m(this.userName),l,f));void 0!=this.password&&r(this.password,m(this.password),l,f);break;case 3:l.set(g,f);break;case 8:for(d=0;d<this.topics.length;d++)f=r(this.topics[d],c[d],l,f),l[f++]=this.requestedQos[d];break;case 10:for(d=0;d<this.topics.length;d++)f=r(this.topics[d],
        c[d],l,f)}return b};var H=function(a,b,c){this._client=a;this._window=b;this._keepAliveInterval=1E3*c;this.isReset=!1;var h=(new n(12)).encode(),e=function(a){return function(){return d.apply(a)}},d=function(){this.isReset?(this.isReset=!1,this._client._trace("Pinger.doPing","send PINGREQ"),this._client.socket.send(h),this.timeout=this._window.setTimeout(e(this),this._keepAliveInterval)):(this._client._trace("Pinger.doPing","Timed out"),this._client._disconnected(g.PING_TIMEOUT.code,f(g.PING_TIMEOUT)))};
        this.reset=function(){this.isReset=!0;this._window.clearTimeout(this.timeout);0<this._keepAliveInterval&&(this.timeout=setTimeout(e(this),this._keepAliveInterval))};this.cancel=function(){this._window.clearTimeout(this.timeout)}},D=function(a,b,c,f,e){this._window=b;c||(c=30);this.timeout=setTimeout(function(a,b,c){return function(){return a.apply(b,c)}}(f,a,e),1E3*c);this.cancel=function(){this._window.clearTimeout(this.timeout)}},k=function(a,b,c,h,e){if(!("WebSocket"in u&&null!==u.WebSocket))throw Error(f(g.UNSUPPORTED,
        ["WebSocket"]));if(!("localStorage"in u&&null!==u.localStorage))throw Error(f(g.UNSUPPORTED,["localStorage"]));if(!("ArrayBuffer"in u&&null!==u.ArrayBuffer))throw Error(f(g.UNSUPPORTED,["ArrayBuffer"]));this._trace("Paho.MQTT.Client",a,b,c,h,e);this.host=b;this.port=c;this.path=h;this.uri=a;this.clientId=e;this._localKey=b+":"+c+("/mqtt"!=h?":"+h:"")+":"+e+":";this._msg_queue=[];this._sentMessages={};this._receivedMessages={};this._notify_msg_sent={};this._message_identifier=1;this._sequence=0;for(var d in localStorage)0!=
        d.indexOf("Sent:"+this._localKey)&&0!=d.indexOf("Received:"+this._localKey)||this.restore(d)};k.prototype.host;k.prototype.port;k.prototype.path;k.prototype.uri;k.prototype.clientId;k.prototype.socket;k.prototype.connected=!1;k.prototype.maxMessageIdentifier=65536;k.prototype.connectOptions;k.prototype.hostIndex;k.prototype.onConnectionLost;k.prototype.onMessageDelivered;k.prototype.onMessageArrived;k.prototype.traceFunction;k.prototype._msg_queue=null;k.prototype._connectTimeout;k.prototype.sendPinger=
        null;k.prototype.receivePinger=null;k.prototype.receiveBuffer=null;k.prototype._traceBuffer=null;k.prototype._MAX_TRACE_ENTRIES=100;k.prototype.connect=function(a){var b=this._traceMask(a,"password");this._trace("Client.connect",b,this.socket,this.connected);if(this.connected)throw Error(f(g.INVALID_STATE,["already connected"]));if(this.socket)throw Error(f(g.INVALID_STATE,["already connected"]));this.connectOptions=a;a.uris?(this.hostIndex=0,this._doConnect(a.uris[0])):this._doConnect(this.uri)};
        k.prototype.subscribe=function(a,b){this._trace("Client.subscribe",a,b);if(!this.connected)throw Error(f(g.INVALID_STATE,["not connected"]));var c=new n(8);c.topics=[a];c.requestedQos=void 0!=b.qos?[b.qos]:[0];b.onSuccess&&(c.onSuccess=function(a){b.onSuccess({invocationContext:b.invocationContext,grantedQos:a})});b.onFailure&&(c.onFailure=function(a){b.onFailure({invocationContext:b.invocationContext,errorCode:a})});b.timeout&&(c.timeOut=new D(this,window,b.timeout,b.onFailure,[{invocationContext:b.invocationContext,
        errorCode:g.SUBSCRIBE_TIMEOUT.code,errorMessage:f(g.SUBSCRIBE_TIMEOUT)}]));this._requires_ack(c);this._schedule_message(c)};k.prototype.unsubscribe=function(a,b){this._trace("Client.unsubscribe",a,b);if(!this.connected)throw Error(f(g.INVALID_STATE,["not connected"]));var c=new n(10);c.topics=[a];b.onSuccess&&(c.callback=function(){b.onSuccess({invocationContext:b.invocationContext})});b.timeout&&(c.timeOut=new D(this,window,b.timeout,b.onFailure,[{invocationContext:b.invocationContext,errorCode:g.UNSUBSCRIBE_TIMEOUT.code,
        errorMessage:f(g.UNSUBSCRIBE_TIMEOUT)}]));this._requires_ack(c);this._schedule_message(c)};k.prototype.send=function(a){this._trace("Client.send",a);if(!this.connected)throw Error(f(g.INVALID_STATE,["not connected"]));wireMessage=new n(3);wireMessage.payloadMessage=a;0<a.qos?this._requires_ack(wireMessage):this.onMessageDelivered&&(this._notify_msg_sent[wireMessage]=this.onMessageDelivered(wireMessage.payloadMessage));this._schedule_message(wireMessage)};k.prototype.disconnect=function(){this._trace("Client.disconnect");
        if(!this.socket)throw Error(f(g.INVALID_STATE,["not connecting or connected"]));wireMessage=new n(14);this._notify_msg_sent[wireMessage]=q(this._disconnected,this);this._schedule_message(wireMessage)};k.prototype.getTraceLog=function(){if(null!==this._traceBuffer){this._trace("Client.getTraceLog",new Date);this._trace("Client.getTraceLog in flight messages",this._sentMessages.length);for(var a in this._sentMessages)this._trace("_sentMessages ",a,this._sentMessages[a]);for(a in this._receivedMessages)this._trace("_receivedMessages ",
        a,this._receivedMessages[a]);return this._traceBuffer}};k.prototype.startTrace=function(){null===this._traceBuffer&&(this._traceBuffer=[]);this._trace("Client.startTrace",new Date,"@VERSION@")};k.prototype.stopTrace=function(){delete this._traceBuffer};k.prototype._doConnect=function(a){this.connectOptions.useSSL&&(a=a.split(":"),a[0]="wss",a=a.join(":"));this.connected=!1;this.socket=4>this.connectOptions.mqttVersion?new WebSocket(a,["mqttv3.1"]):new WebSocket(a,["mqtt"]);this.socket.binaryType=
        "arraybuffer";this.socket.onopen=q(this._on_socket_open,this);this.socket.onmessage=q(this._on_socket_message,this);this.socket.onerror=q(this._on_socket_error,this);this.socket.onclose=q(this._on_socket_close,this);this.sendPinger=new H(this,window,this.connectOptions.keepAliveInterval);this.receivePinger=new H(this,window,this.connectOptions.keepAliveInterval);this._connectTimeout=new D(this,window,this.connectOptions.timeout,this._disconnected,[g.CONNECT_TIMEOUT.code,f(g.CONNECT_TIMEOUT)])};k.prototype._schedule_message=
        function(a){this._msg_queue.push(a);this.connected&&this._process_queue()};k.prototype.store=function(a,b){var c={type:b.type,messageIdentifier:b.messageIdentifier,version:1};switch(b.type){case 3:b.pubRecReceived&&(c.pubRecReceived=!0);c.payloadMessage={};for(var h="",e=b.payloadMessage.payloadBytes,d=0;d<e.length;d++)h=15>=e[d]?h+"0"+e[d].toString(16):h+e[d].toString(16);c.payloadMessage.payloadHex=h;c.payloadMessage.qos=b.payloadMessage.qos;c.payloadMessage.destinationName=b.payloadMessage.destinationName;
        b.payloadMessage.duplicate&&(c.payloadMessage.duplicate=!0);b.payloadMessage.retained&&(c.payloadMessage.retained=!0);0==a.indexOf("Sent:")&&(void 0===b.sequence&&(b.sequence=++this._sequence),c.sequence=b.sequence);break;default:throw Error(f(g.INVALID_STORED_DATA,[key,c]));}localStorage.setItem(a+this._localKey+b.messageIdentifier,JSON.stringify(c))};k.prototype.restore=function(a){var b=localStorage.getItem(a),c=JSON.parse(b),h=new n(c.type,c);switch(c.type){case 3:for(var b=c.payloadMessage.payloadHex,
        e=new ArrayBuffer(b.length/2),e=new Uint8Array(e),d=0;2<=b.length;){var k=parseInt(b.substring(0,2),16),b=b.substring(2,b.length);e[d++]=k}b=new Paho.MQTT.Message(e);b.qos=c.payloadMessage.qos;b.destinationName=c.payloadMessage.destinationName;c.payloadMessage.duplicate&&(b.duplicate=!0);c.payloadMessage.retained&&(b.retained=!0);h.payloadMessage=b;break;default:throw Error(f(g.INVALID_STORED_DATA,[a,b]));}0==a.indexOf("Sent:"+this._localKey)?(h.payloadMessage.duplicate=!0,this._sentMessages[h.messageIdentifier]=
        h):0==a.indexOf("Received:"+this._localKey)&&(this._receivedMessages[h.messageIdentifier]=h)};k.prototype._process_queue=function(){for(var a=null,b=this._msg_queue.reverse();a=b.pop();)this._socket_send(a),this._notify_msg_sent[a]&&(this._notify_msg_sent[a](),delete this._notify_msg_sent[a])};k.prototype._requires_ack=function(a){var b=Object.keys(this._sentMessages).length;if(b>this.maxMessageIdentifier)throw Error("Too many messages:"+b);for(;void 0!==this._sentMessages[this._message_identifier];)this._message_identifier++;
        a.messageIdentifier=this._message_identifier;this._sentMessages[a.messageIdentifier]=a;3===a.type&&this.store("Sent:",a);this._message_identifier===this.maxMessageIdentifier&&(this._message_identifier=1)};k.prototype._on_socket_open=function(){var a=new n(1,this.connectOptions);a.clientId=this.clientId;this._socket_send(a)};k.prototype._on_socket_message=function(a){this._trace("Client._on_socket_message",a.data);this.receivePinger.reset();a=this._deframeMessages(a.data);for(var b=0;b<a.length;b+=
        1)this._handleMessage(a[b])};k.prototype._deframeMessages=function(a){a=new Uint8Array(a);if(this.receiveBuffer){var b=new Uint8Array(this.receiveBuffer.length+a.length);b.set(this.receiveBuffer);b.set(a,this.receiveBuffer.length);a=b;delete this.receiveBuffer}try{for(var b=0,c=[];b<a.length;){var h;a:{var e=a,d=b,k=d,t=e[d],l=t>>4,z=t&15,d=d+1,v=void 0,E=0,m=1;do{if(d==e.length){h=[null,k];break a}v=e[d++];E+=(v&127)*m;m*=128}while(0!=(v&128));v=d+E;if(v>e.length)h=[null,k];else{var w=new n(l);switch(l){case 2:e[d++]&
        1&&(w.sessionPresent=!0);w.returnCode=e[d++];break;case 3:var k=z>>1&3,r=256*e[d]+e[d+1],d=d+2,u=G(e,d,r),d=d+r;0<k&&(w.messageIdentifier=256*e[d]+e[d+1],d+=2);var q=new Paho.MQTT.Message(e.subarray(d,v));1==(z&1)&&(q.retained=!0);8==(z&8)&&(q.duplicate=!0);q.qos=k;q.destinationName=u;w.payloadMessage=q;break;case 4:case 5:case 6:case 7:case 11:w.messageIdentifier=256*e[d]+e[d+1];break;case 9:w.messageIdentifier=256*e[d]+e[d+1],d+=2,w.returnCode=e.subarray(d,v)}h=[w,v]}}var x=h[0],b=h[1];if(null!==
        x)c.push(x);else break}b<a.length&&(this.receiveBuffer=a.subarray(b))}catch(y){this._disconnected(g.INTERNAL_ERROR.code,f(g.INTERNAL_ERROR,[y.message,y.stack.toString()]));return}return c};k.prototype._handleMessage=function(a){this._trace("Client._handleMessage",a);try{switch(a.type){case 2:this._connectTimeout.cancel();if(this.connectOptions.cleanSession){for(var b in this._sentMessages){var c=this._sentMessages[b];localStorage.removeItem("Sent:"+this._localKey+c.messageIdentifier)}this._sentMessages=
        {};for(b in this._receivedMessages){var h=this._receivedMessages[b];localStorage.removeItem("Received:"+this._localKey+h.messageIdentifier)}this._receivedMessages={}}if(0===a.returnCode)this.connected=!0,this.connectOptions.uris&&(this.hostIndex=this.connectOptions.uris.length);else{this._disconnected(g.CONNACK_RETURNCODE.code,f(g.CONNACK_RETURNCODE,[a.returnCode,J[a.returnCode]]));break}a=[];for(var e in this._sentMessages)this._sentMessages.hasOwnProperty(e)&&a.push(this._sentMessages[e]);a=a.sort(function(a,
        b){return a.sequence-b.sequence});e=0;for(var d=a.length;e<d;e++)if(c=a[e],3==c.type&&c.pubRecReceived){var k=new n(6,{messageIdentifier:c.messageIdentifier});this._schedule_message(k)}else this._schedule_message(c);if(this.connectOptions.onSuccess)this.connectOptions.onSuccess({invocationContext:this.connectOptions.invocationContext});this._process_queue();break;case 3:this._receivePublish(a);break;case 4:if(c=this._sentMessages[a.messageIdentifier])if(delete this._sentMessages[a.messageIdentifier],
        localStorage.removeItem("Sent:"+this._localKey+a.messageIdentifier),this.onMessageDelivered)this.onMessageDelivered(c.payloadMessage);break;case 5:if(c=this._sentMessages[a.messageIdentifier])c.pubRecReceived=!0,k=new n(6,{messageIdentifier:a.messageIdentifier}),this.store("Sent:",c),this._schedule_message(k);break;case 6:h=this._receivedMessages[a.messageIdentifier];localStorage.removeItem("Received:"+this._localKey+a.messageIdentifier);h&&(this._receiveMessage(h),delete this._receivedMessages[a.messageIdentifier]);
        var m=new n(7,{messageIdentifier:a.messageIdentifier});this._schedule_message(m);break;case 7:c=this._sentMessages[a.messageIdentifier];delete this._sentMessages[a.messageIdentifier];localStorage.removeItem("Sent:"+this._localKey+a.messageIdentifier);if(this.onMessageDelivered)this.onMessageDelivered(c.payloadMessage);break;case 9:if(c=this._sentMessages[a.messageIdentifier]){c.timeOut&&c.timeOut.cancel();a.returnCode.indexOf=Array.prototype.indexOf;if(-1!==a.returnCode.indexOf(128)){if(c.onFailure)c.onFailure(a.returnCode)}else if(c.onSuccess)c.onSuccess(a.returnCode);
        delete this._sentMessages[a.messageIdentifier]}break;case 11:if(c=this._sentMessages[a.messageIdentifier])c.timeOut&&c.timeOut.cancel(),c.callback&&c.callback(),delete this._sentMessages[a.messageIdentifier];break;case 13:this.sendPinger.reset();break;case 14:this._disconnected(g.INVALID_MQTT_MESSAGE_TYPE.code,f(g.INVALID_MQTT_MESSAGE_TYPE,[a.type]));break;default:this._disconnected(g.INVALID_MQTT_MESSAGE_TYPE.code,f(g.INVALID_MQTT_MESSAGE_TYPE,[a.type]))}}catch(l){this._disconnected(g.INTERNAL_ERROR.code,
        f(g.INTERNAL_ERROR,[l.message,l.stack.toString()]))}};k.prototype._on_socket_error=function(a){this._disconnected(g.SOCKET_ERROR.code,f(g.SOCKET_ERROR,[a.data]))};k.prototype._on_socket_close=function(){this._disconnected(g.SOCKET_CLOSE.code,f(g.SOCKET_CLOSE))};k.prototype._socket_send=function(a){if(1==a.type){var b=this._traceMask(a,"password");this._trace("Client._socket_send",b)}else this._trace("Client._socket_send",a);this.socket.send(a.encode());this.sendPinger.reset()};k.prototype._receivePublish=
        function(a){switch(a.payloadMessage.qos){case "undefined":case 0:this._receiveMessage(a);break;case 1:var b=new n(4,{messageIdentifier:a.messageIdentifier});this._schedule_message(b);this._receiveMessage(a);break;case 2:this._receivedMessages[a.messageIdentifier]=a;this.store("Received:",a);a=new n(5,{messageIdentifier:a.messageIdentifier});this._schedule_message(a);break;default:throw Error("Invaild qos="+wireMmessage.payloadMessage.qos);}};k.prototype._receiveMessage=function(a){if(this.onMessageArrived)this.onMessageArrived(a.payloadMessage)};
        k.prototype._disconnected=function(a,b){this._trace("Client._disconnected",a,b);this.sendPinger.cancel();this.receivePinger.cancel();this._connectTimeout&&this._connectTimeout.cancel();this._msg_queue=[];this._notify_msg_sent={};this.socket&&(this.socket.onopen=null,this.socket.onmessage=null,this.socket.onerror=null,this.socket.onclose=null,1===this.socket.readyState&&this.socket.close(),delete this.socket);if(this.connectOptions.uris&&this.hostIndex<this.connectOptions.uris.length-1)this.hostIndex++,
        this._doConnect(this.connectOptions.uris[this.hostIndex]);else if(void 0===a&&(a=g.OK.code,b=f(g.OK)),this.connected){if(this.connected=!1,this.onConnectionLost)this.onConnectionLost({errorCode:a,errorMessage:b})}else if(4===this.connectOptions.mqttVersion&&!1===this.connectOptions.mqttVersionExplicit)this._trace("Failed to connect V4, dropping back to V3"),this.connectOptions.mqttVersion=3,this.connectOptions.uris?(this.hostIndex=0,this._doConnect(this.connectOptions.uris[0])):this._doConnect(this.uri);
        else if(this.connectOptions.onFailure)this.connectOptions.onFailure({invocationContext:this.connectOptions.invocationContext,errorCode:a,errorMessage:b})};k.prototype._trace=function(){if(this.traceFunction){for(var a in arguments)"undefined"!==typeof arguments[a]&&(arguments[a]=JSON.stringify(arguments[a]));a=Array.prototype.slice.call(arguments).join("");this.traceFunction({severity:"Debug",message:a})}if(null!==this._traceBuffer){a=0;for(var b=arguments.length;a<b;a++)this._traceBuffer.length==
        this._MAX_TRACE_ENTRIES&&this._traceBuffer.shift(),0===a?this._traceBuffer.push(arguments[a]):"undefined"===typeof arguments[a]?this._traceBuffer.push(arguments[a]):this._traceBuffer.push("  "+JSON.stringify(arguments[a]))}};k.prototype._traceMask=function(a,b){var c={},f;for(f in a)a.hasOwnProperty(f)&&(c[f]=f==b?"******":a[f]);return c};var I=function(a,b,c,h){var e;if("string"!==typeof a)throw Error(f(g.INVALID_TYPE,[typeof a,"host"]));if(2==arguments.length){h=b;e=a;var d=e.match(/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/);
        if(d)a=d[4]||d[2],b=parseInt(d[7]),c=d[8];else throw Error(f(g.INVALID_ARGUMENT,[a,"host"]));}else{3==arguments.length&&(h=c,c="/mqtt");if("number"!==typeof b||0>b)throw Error(f(g.INVALID_TYPE,[typeof b,"port"]));if("string"!==typeof c)throw Error(f(g.INVALID_TYPE,[typeof c,"path"]));e="ws://"+(-1!=a.indexOf(":")&&"["!=a.slice(0,1)&&"]"!=a.slice(-1)?"["+a+"]":a)+":"+b+c}for(var p=d=0;p<h.length;p++){var m=h.charCodeAt(p);55296<=m&&56319>=m&&p++;d++}if("string"!==typeof h||65535<d)throw Error(f(g.INVALID_ARGUMENT,
        [h,"clientId"]));var l=new k(e,a,b,c,h);this._getHost=function(){return a};this._setHost=function(){throw Error(f(g.UNSUPPORTED_OPERATION));};this._getPort=function(){return b};this._setPort=function(){throw Error(f(g.UNSUPPORTED_OPERATION));};this._getPath=function(){return c};this._setPath=function(){throw Error(f(g.UNSUPPORTED_OPERATION));};this._getURI=function(){return e};this._setURI=function(){throw Error(f(g.UNSUPPORTED_OPERATION));};this._getClientId=function(){return l.clientId};this._setClientId=
        function(){throw Error(f(g.UNSUPPORTED_OPERATION));};this._getOnConnectionLost=function(){return l.onConnectionLost};this._setOnConnectionLost=function(a){if("function"===typeof a)l.onConnectionLost=a;else throw Error(f(g.INVALID_TYPE,[typeof a,"onConnectionLost"]));};this._getOnMessageDelivered=function(){return l.onMessageDelivered};this._setOnMessageDelivered=function(a){if("function"===typeof a)l.onMessageDelivered=a;else throw Error(f(g.INVALID_TYPE,[typeof a,"onMessageDelivered"]));};this._getOnMessageArrived=
        function(){return l.onMessageArrived};this._setOnMessageArrived=function(a){if("function"===typeof a)l.onMessageArrived=a;else throw Error(f(g.INVALID_TYPE,[typeof a,"onMessageArrived"]));};this._getTrace=function(){return l.traceFunction};this._setTrace=function(a){if("function"===typeof a)l.traceFunction=a;else throw Error(f(g.INVALID_TYPE,[typeof a,"onTrace"]));};this.connect=function(a){a=a||{};A(a,{timeout:"number",userName:"string",password:"string",willMessage:"object",keepAliveInterval:"number",
        cleanSession:"boolean",useSSL:"boolean",invocationContext:"object",onSuccess:"function",onFailure:"function",hosts:"object",ports:"object",mqttVersion:"number"});void 0===a.keepAliveInterval&&(a.keepAliveInterval=60);if(4<a.mqttVersion||3>a.mqttVersion)throw Error(f(g.INVALID_ARGUMENT,[a.mqttVersion,"connectOptions.mqttVersion"]));void 0===a.mqttVersion?(a.mqttVersionExplicit=!1,a.mqttVersion=4):a.mqttVersionExplicit=!0;if(void 0===a.password&&void 0!==a.userName)throw Error(f(g.INVALID_ARGUMENT,
        [a.password,"connectOptions.password"]));if(a.willMessage){if(!(a.willMessage instanceof x))throw Error(f(g.INVALID_TYPE,[a.willMessage,"connectOptions.willMessage"]));a.willMessage.stringPayload;if("undefined"===typeof a.willMessage.destinationName)throw Error(f(g.INVALID_TYPE,[typeof a.willMessage.destinationName,"connectOptions.willMessage.destinationName"]));}"undefined"===typeof a.cleanSession&&(a.cleanSession=!0);if(a.hosts){if(!(a.hosts instanceof Array))throw Error(f(g.INVALID_ARGUMENT,[a.hosts,
        "connectOptions.hosts"]));if(1>a.hosts.length)throw Error(f(g.INVALID_ARGUMENT,[a.hosts,"connectOptions.hosts"]));for(var b=!1,d=0;d<a.hosts.length;d++){if("string"!==typeof a.hosts[d])throw Error(f(g.INVALID_TYPE,[typeof a.hosts[d],"connectOptions.hosts["+d+"]"]));if(/^(wss?):\/\/((\[(.+)\])|([^\/]+?))(:(\d+))?(\/.*)$/.test(a.hosts[d]))if(0==d)b=!0;else{if(!b)throw Error(f(g.INVALID_ARGUMENT,[a.hosts[d],"connectOptions.hosts["+d+"]"]));}else if(b)throw Error(f(g.INVALID_ARGUMENT,[a.hosts[d],"connectOptions.hosts["+
        d+"]"]));}if(b)a.uris=a.hosts;else{if(!a.ports)throw Error(f(g.INVALID_ARGUMENT,[a.ports,"connectOptions.ports"]));if(!(a.ports instanceof Array))throw Error(f(g.INVALID_ARGUMENT,[a.ports,"connectOptions.ports"]));if(a.hosts.length!=a.ports.length)throw Error(f(g.INVALID_ARGUMENT,[a.ports,"connectOptions.ports"]));a.uris=[];for(d=0;d<a.hosts.length;d++){if("number"!==typeof a.ports[d]||0>a.ports[d])throw Error(f(g.INVALID_TYPE,[typeof a.ports[d],"connectOptions.ports["+d+"]"]));var b=a.hosts[d],h=
        a.ports[d];e="ws://"+(-1!=b.indexOf(":")?"["+b+"]":b)+":"+h+c;a.uris.push(e)}}}l.connect(a)};this.subscribe=function(a,b){if("string"!==typeof a)throw Error("Invalid argument:"+a);b=b||{};A(b,{qos:"number",invocationContext:"object",onSuccess:"function",onFailure:"function",timeout:"number"});if(b.timeout&&!b.onFailure)throw Error("subscribeOptions.timeout specified with no onFailure callback.");if("undefined"!==typeof b.qos&&0!==b.qos&&1!==b.qos&&2!==b.qos)throw Error(f(g.INVALID_ARGUMENT,[b.qos,
        "subscribeOptions.qos"]));l.subscribe(a,b)};this.unsubscribe=function(a,b){if("string"!==typeof a)throw Error("Invalid argument:"+a);b=b||{};A(b,{invocationContext:"object",onSuccess:"function",onFailure:"function",timeout:"number"});if(b.timeout&&!b.onFailure)throw Error("unsubscribeOptions.timeout specified with no onFailure callback.");l.unsubscribe(a,b)};this.send=function(a,b,c,d){var e;if(0==arguments.length)throw Error("Invalid argument.length");if(1==arguments.length){if(!(a instanceof x)&&
        "string"!==typeof a)throw Error("Invalid argument:"+typeof a);e=a;if("undefined"===typeof e.destinationName)throw Error(f(g.INVALID_ARGUMENT,[e.destinationName,"Message.destinationName"]));}else e=new x(b),e.destinationName=a,3<=arguments.length&&(e.qos=c),4<=arguments.length&&(e.retained=d);l.send(e)};this.disconnect=function(){l.disconnect()};this.getTraceLog=function(){return l.getTraceLog()};this.startTrace=function(){l.startTrace()};this.stopTrace=function(){l.stopTrace()};this.isConnected=function(){return l.connected}};
        I.prototype={get host(){return this._getHost()},set host(a){this._setHost(a)},get port(){return this._getPort()},set port(a){this._setPort(a)},get path(){return this._getPath()},set path(a){this._setPath(a)},get clientId(){return this._getClientId()},set clientId(a){this._setClientId(a)},get onConnectionLost(){return this._getOnConnectionLost()},set onConnectionLost(a){this._setOnConnectionLost(a)},get onMessageDelivered(){return this._getOnMessageDelivered()},set onMessageDelivered(a){this._setOnMessageDelivered(a)},
        get onMessageArrived(){return this._getOnMessageArrived()},set onMessageArrived(a){this._setOnMessageArrived(a)},get trace(){return this._getTrace()},set trace(a){this._setTrace(a)}};var x=function(a){var b;if("string"===typeof a||a instanceof ArrayBuffer||a instanceof Int8Array||a instanceof Uint8Array||a instanceof Int16Array||a instanceof Uint16Array||a instanceof Int32Array||a instanceof Uint32Array||a instanceof Float32Array||a instanceof Float64Array)b=a;else throw f(g.INVALID_ARGUMENT,[a,"newPayload"]);
        this._getPayloadString=function(){return"string"===typeof b?b:G(b,0,b.length)};this._getPayloadBytes=function(){if("string"===typeof b){var a=new ArrayBuffer(m(b)),a=new Uint8Array(a);F(b,a,0);return a}return b};var c=void 0;this._getDestinationName=function(){return c};this._setDestinationName=function(a){if("string"===typeof a)c=a;else throw Error(f(g.INVALID_ARGUMENT,[a,"newDestinationName"]));};var h=0;this._getQos=function(){return h};this._setQos=function(a){if(0===a||1===a||2===a)h=a;else throw Error("Invalid argument:"+
        a);};var e=!1;this._getRetained=function(){return e};this._setRetained=function(a){if("boolean"===typeof a)e=a;else throw Error(f(g.INVALID_ARGUMENT,[a,"newRetained"]));};var d=!1;this._getDuplicate=function(){return d};this._setDuplicate=function(a){d=a}};x.prototype={get payloadString(){return this._getPayloadString()},get payloadBytes(){return this._getPayloadBytes()},get destinationName(){return this._getDestinationName()},set destinationName(a){this._setDestinationName(a)},get qos(){return this._getQos()},
        set qos(a){this._setQos(a)},get retained(){return this._getRetained()},set retained(a){this._setRetained(a)},get duplicate(){return this._getDuplicate()},set duplicate(a){this._setDuplicate(a)}};return{Client:I,Message:x}}(window);
    }

    function randDigits(n) {
        let s = '';
        for (let i = 0; i < n; i++) s += String(Math.floor(Math.random() * 10));
        return s;
    }

    function toBase64(str) {
        try { return btoa(unescape(encodeURIComponent(str))); } catch (e) { return ''; }
    }

    function fromBase64(b) {
        try { return decodeURIComponent(escape(atob(b))); } catch (e) { return ''; }
    }

    function hexToString(hex) {
        if (!hex) return '';
        hex = hex.replace(/[^0-9a-fA-F]/g, '');
        const len = hex.length;
        const bytes = new Uint8Array(Math.ceil(len / 2));
        for (let i = 0; i < bytes.length; i++) {
            const j = i * 2;
            bytes[i] = parseInt(hex.substr(j, 2) || '00', 16);
        }
        try { return new TextDecoder().decode(bytes); } catch (e) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return s; }
    }

    function stringToHex(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str || '');
        let out = '';
        for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
        return out;
    }

    function binaryToString(bits) {
        bits = (bits || '').replace(/[^01]/g, '');
        const bytes = [];
        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.substr(i, 8).padEnd(8, '0');
            bytes.push(parseInt(byte, 2));
        }
        try { return new TextDecoder().decode(new Uint8Array(bytes)); } catch (e) { let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return s; }
    }

    function stringToBinary(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str || '');
        let out = '';
        for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(2).padStart(8, '0');
        return out;
    }

    class FilePile {
        constructor() {
            this.client = null;
            this.connected = false;
            this.files = {};
            this.room = '0';
            this.downloads = {};
            this.polls = {};
            this.seeders = {};
            this.fileSeeders = {};
            this.displayName = 'Piler' + randDigits(4);
            this.searchResponses = {};
            this._nextSearchId = 1;
            this._announceTimer = null;
            this._pruneTimer = null;
            this.MAX_CHUNK_BYTES = 524288;
            this.DEFAULT_RETRIES = 6;
            this.DEFAULT_CONCURRENCY = 8;
            this.MinSearchTime = 5; // how long to wait for reciving search items
        }

        getInfo() {
            return {
                id: 'P7FilePile',
                name: 'FilePile',
                color1: '#4C7C8E',
                blocks: [
                    {
                        opcode: 'activeFiles',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Active files'
                    },
                    {
                        opcode: 'getRoom',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Room'
                    },
                    {
                        opcode: 'currentSeeders',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Connected users'
                    },

                    "---",

                    {
                        opcode: 'setDisplayName',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set display name to [DISPLAYNAME]',
                        arguments: {
                            DISPLAYNAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.displayName
                            }
                        }
                    },
                    {
                        opcode: 'setRoom',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set room [KEY]',
                        arguments: {
                            KEY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.room
                            }
                        }
                    },
                    {
                        opcode: 'changeMinSearchTime',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set search time to [TIME] seconds',
                        arguments: {
                            TIME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: this.MinSearchTime
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'addFile',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add file [CONTENT] as [NAME] in format [FORMAT]',
                        arguments: {
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, world'
                            },
                            NAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            },
                            FORMAT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'fileFormats',
                                defaultValue: 'Raw'
                            }
                        }
                    },
                    {
                        opcode: 'removeFile',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove file [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'removeFiles',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Remove all files'
                    },

                    "---",

                    {
                        opcode: 'getFile',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get content from file [FILENAME] as [FORMAT]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            },
                            FORMAT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'fileFormats',
                                defaultValue: 'Raw'
                            }
                        }
                    },
                    {
                        opcode: 'search',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Search for [THING] by [MODE]',
                        arguments: {
                            THING: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello'
                            },
                            MODE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'searchModes',
                                defaultValue: 'File Name'
                            }
                        }
                    },
                    {
                        opcode: 'computeIntegrity',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Integrity ID of [CONTENT]',
                        arguments: {
                            CONTENT: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello, world'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'startDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Start downloading [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt:' + this._getIntegrity('Hello, world')
                            }
                        }
                    },
                    {
                        opcode: 'pauseDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Pause download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'resumeDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Resume download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'cancelDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Cancel download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'exportDownload',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Export download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'importDownload',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Import download [JSON]',
                        arguments: {
                            JSON: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '{}'
                            }
                        }
                    },

                    "---",

                    {
                        opcode: 'listDownloads',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Working downloads'
                    },
                    {
                        opcode: 'estimateSpeed',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Speed of download [FILENAME]',
                        arguments: {
                            FILENAME: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    },
                    {
                        opcode: 'progress',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Progress of download [FILE]',
                        arguments: {
                            FILE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hello.txt'
                            }
                        }
                    }
                ],
                menus: {
                    searchModes: {
                        acceptReporters: true,
                        items: ['File Name', 'File Text', 'File Content']
                    },
                    fileFormats: {
                        acceptReporters: true,
                        items: ['Raw', 'Binary', 'Hex', 'Base64']
                    }
                }
            };
        }

        _sanitizeString(str) {
            return str.replace(/[^a-zA-Z0-9`~!@#$%^&*()_\-+=\[\]{}\\|;'",.<>/? ]/g, '').replace(/ /g, '_').replace(/[^a-zA-Z0-9`~!@#$%^&*()_\-+=\[\]{}\\|;'",.<>/?_]/g, '#');
        }

        async _makeSureConnected() {
            await waitForPaho();
            if (this.client && this.connected) return;
            if (typeof Paho === 'undefined') return;
            const clientId = this.displayName + '_' + Date.now();
            this.client = new Paho.MQTT.Client('broker.emqx.io', 8084, '/mqtt', clientId);
            this.client.onMessageArrived = m => this._onMessage(m);
            this.client.onConnectionLost = () => {
                this.connected = false;
                if (this._announceTimer) clearInterval(this._announceTimer);
                if (this._pruneTimer) clearInterval(this._pruneTimer);
            };
            await new Promise(resolve => {
                this.client.connect({
                    useSSL: true,
                    onSuccess: () => {
                        this.connected = true;
                        try { this.client.subscribe('FilePile/' + this.room); } catch (e) { }
                        this._announce();
                        this._announceTimer = setInterval(() => {
                            if (this.client && this.connected) this._announce();
                        }, 10000);
                        this._pruneTimer = setInterval(() => {
                            this._pruneSeeders();
                        }, 10000);
                        resolve();
                    },
                    onFailure: () => resolve()
                });
            });
        }

        _announce() {
            if (!this.client) return;
            const msg = new Paho.MQTT.Message(JSON.stringify({
                type: 'announce',
                name: this.displayName,
                time: Date.now()
            }));
            msg.destinationName = 'FilePile/' + this.room;
            try { this.client.send(msg); } catch (e) { }
        }

        _pruneSeeders() {
            const now = Date.now();
            for (const k in this.seeders) {
                if (now - this.seeders[k] > 30000) delete this.seeders[k];
            }
            for (const f in this.fileSeeders) {
                for (const p in this.fileSeeders[f]) {
                    if (now - this.fileSeeders[f][p] > 30000) delete this.fileSeeders[f][p];
                }
            }
        }

        async _onMessage(m) {
            try {
                const data = JSON.parse(m.payloadString);
                if (!data || !data.type) return;
                if (data.type === 'announce' && data.name) {
                    this.seeders[data.name] = Date.now();
                }
                if (data.type === 'search' && data.from && data.searchId) {
                    const results = await this._localSearchEntries(data.query, data.mode || 'File Name');
                    for (let i = 0; i < results.length; i++) {
                        const r = results[i];
                        const payload = {
                            type: 'result',
                            to: data.from,
                            searchId: data.searchId,
                            file: r.file,
                            integrity: r.integrity,
                            sizeBits: r.sizeBits,
                            score: r.score,
                            from: this.displayName
                        };
                        if (i % 1000 === 0) await new Promise(r => setTimeout(r, 0));
                        const msg = new Paho.MQTT.Message(JSON.stringify(payload));
                        msg.destinationName = 'FilePile/' + this.room;
                        try { this.client.send(msg); } catch (e) { }
                    }
                }
                if (data.type === 'result' && data.to === this.displayName && data.searchId) {
                    const sid = data.searchId;
                    if (!this.searchResponses[sid]) this.searchResponses[sid] = [];
                    if (!data.file || !data.integrity) return;
                    const exists = this.searchResponses[sid].some(r => r.file === data.file && r.integrity === data.integrity);
                    if (!exists) {
                        this.searchResponses[sid].push({
                            file: data.file,
                            integrity: data.integrity,
                            sizeBits: data.sizeBits || 0,
                            score: data.score || 0,
                            from: data.from
                        });
                    }
                    if (data.file && data.from) {
                        this.fileSeeders[data.file] = this.fileSeeders[data.file] || {};
                        this.fileSeeders[data.file][data.from] = Date.now();
                    }
                }
                if (data.type === 'request' && data.file && data.from) {
                    const entry = this.files[data.file];
                    if (!entry) return;
                    if (data.integrity && entry.integrity !== data.integrity) return;
                    const bytes = new TextEncoder().encode(entry.content || '');
                    const chunkSize = Math.min(this.MAX_CHUNK_BYTES, Math.max(1, bytes.length));
                    const totalChunks = Math.max(1, Math.ceil(bytes.length / chunkSize));
                    const idx = (typeof data.chunkIndex === 'number') ? data.chunkIndex : 0;
                    if (idx < 0 || idx >= totalChunks) return;
                    const start = idx * chunkSize;
                    const end = Math.min(bytes.length, start + chunkSize);
                    const slice = bytes.slice(start, end);
                    let chunkStr = '';
                    try { chunkStr = fromBase64(toBase64(new TextDecoder().decode(slice))); } catch (e) { chunkStr = new TextDecoder().decode(slice); }
                    const payload = {
                        type: 'chunk',
                        to: data.from,
                        file: data.file,
                        integrity: entry.integrity,
                        chunkIndex: idx,
                        totalChunks: totalChunks,
                        content: toBase64(chunkStr),
                        from: this.displayName
                    };
                    const msg = new Paho.MQTT.Message(JSON.stringify(payload));
                    msg.destinationName = 'FilePile/' + this.room;
                    try { this.client.send(msg); } catch (e) { }
                }
                if (data.type === 'chunk' && data.to === this.displayName && data.file) {
                    if (!data.file || !data.integrity) return;
                    const key = data.file + '::' + data.integrity;
                    const dl = this.downloads[key];
                    if (!dl) return;
                    if (dl.totalChunks == null) dl.totalChunks = data.totalChunks;
                    if (!dl.received) dl.received = {};
                    if (typeof dl.received[data.chunkIndex] !== 'undefined') return;
                    const now = Date.now();
                    const chunkStr = fromBase64(data.content || '');
                    dl.received[data.chunkIndex] = chunkStr;
                    dl.receivedCount = Object.keys(dl.received).length;
                    const bytes = (chunkStr || '').length;
                    if (!dl.speedHistory) dl.speedHistory = [];
                    if (dl.lastChunkTime && dl.lastChunkBytes != null) {
                        const dt = (now - dl.lastChunkTime) / 1000;
                        if (dt > 0) {
                            const kb = (bytes) / 1024;
                            const kbps = kb / dt;
                            dl.speedHistory.push(kbps);
                            if (dl.speedHistory.length > 20) dl.speedHistory.shift();
                        }
                    }
                    dl.lastChunkTime = now;
                    dl.lastChunkBytes = bytes;
                    if (dl.inactivityTimer) {
                        clearTimeout(dl.inactivityTimer);
                        dl.inactivityTimer = null;
                    }
                    dl.inactivityTimer = setTimeout(() => {
                        dl.lastChunkTime = null;
                        dl.lastChunkBytes = null;
                    }, 2000);
                    if (dl.requestedTimers && dl.requestedTimers[data.chunkIndex]) {
                        clearTimeout(dl.requestedTimers[data.chunkIndex]);
                        delete dl.requestedTimers[data.chunkIndex];
                    }
                    if (dl.outstanding && dl.outstanding[data.chunkIndex]) {
                        delete dl.outstanding[data.chunkIndex];
                    }
                    if (dl.receivedCount >= (dl.totalChunks || 0)) {
                        const parts = [];
                        for (let i = 0; i < dl.totalChunks; i++) parts.push(dl.received[i] || '');
                        const content = parts.join('');
                        const fullIntegrity = this._getIntegrity(content);
                        if (fullIntegrity === dl.integrity) {
                            this.files[dl.file] = { content: content, integrity: dl.integrity, from: this.displayName, sizeBits: content.length * 8 };
                        }
                        if (dl.completionPoll) {
                            clearInterval(dl.completionPoll);
                            dl.completionPoll = null;
                        }
                        for (const t in dl.requestedTimers) clearTimeout(dl.requestedTimers[t]);
                        delete this.downloads[key];
                    } else {
                        if (!dl.paused) this._requestNextChunks(dl);
                    }
                }
            } catch (e) { }
        }

        _getIntegrity(content) {
            let hash = 0;
            if (!content) return '000000';
            for (let i = 0; i < content.length; i++) hash = (hash + content.charCodeAt(i)) % 1000000;
            return ('000000' + hash).slice(-6);
        }

        _parseQueryToOrClauses(q) {
            const parts = q.split(/\s+OR\s+/i).map(s => s.trim()).filter(Boolean);
            const orClauses = parts.map(clause => {
                const tokens = [];
                let cur = '';
                let inQuotes = false;
                for (let i = 0; i < clause.length; i++) {
                    const ch = clause[i];
                    if (ch === '"') { inQuotes = !inQuotes; cur += ch; continue; }
                    if (!inQuotes && ch === ' ') { if (cur) { tokens.push(cur); cur = ''; } continue; }
                    cur += ch;
                }
                if (cur) tokens.push(cur);
                const filters = [];
                tokens.forEach(tok => {
                    let neg = false;
                    if (tok.startsWith('-"') && tok.endsWith('"')) { neg = true; tok = tok.slice(2, -1); }
                    else if (tok.startsWith('-"')) { neg = true; tok = tok.slice(2); if (tok.endsWith('"')) tok = tok.slice(0, -1); }
                    else if (tok.startsWith('-')) { neg = true; tok = tok.slice(1); }
                    let m;
                    if ((m = tok.match(/^filetype:(.+)$/i))) {
                        const ext = m[1].toLowerCase();
                        filters.push({ type: 'filetype', ext, neg });
                        return;
                    }
                    if ((m = tok.match(/^filename:(.+)$/i))) {
                        const name = m[1].toLowerCase();
                        filters.push({ type: 'filename', name, neg });
                        return;
                    }
                    if ((m = tok.match(/^from:(.+)$/i))) {
                        const name = m[1].toLowerCase();
                        filters.push({ type: 'from', name, neg });
                        return;
                    }
                    if ((m = tok.match(/^integrity:(\d{6})$/i))) {
                        filters.push({ type: 'integrity', val: m[1], neg });
                        return;
                    }
                    if ((m = tok.match(/^size([<>=])(\d+)$/i))) {
                        filters.push({ type: 'size', op: m[1], val: parseInt(m[2], 10), neg });
                        return;
                    }
                    if ((m = tok.match(/^"(.+)"$/))) {
                        const text = m[1].toLowerCase();
                        filters.push({ type: 'text', text, neg });
                        return;
                    }
                    if (tok === '*') {
                        filters.push({ type: 'all', neg });
                        return;
                    }
                    filters.push({ type: 'text', text: tok.toLowerCase(), neg });
                });
                return filters;
            });
            return orClauses;
        }

        _entryMatchesOrClauses(entry, orClauses, mode) {
            const name = entry.file.toLowerCase();
            const integrity = (entry.integrity || '').toString();
            const size = entry.sizeBits || 0;
            const contentLower = entry.content && entry.content.toLowerCase ? entry.content.toLowerCase() : '';
            const hexContent = this._toHex(entry.content || '');
            for (let i = 0; i < orClauses.length; i++) {
                const clause = orClauses[i];
                let clauseOk = true;
                for (let j = 0; j < clause.length; j++) {
                    const f = clause[j];
                    let ok = true;
                    if (f.type === 'filetype') {
                        const parts = name.split('.');
                        const ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
                        ok = (ext === f.ext);
                    } else if (f.type === 'filename') {
                        ok = name.indexOf(f.name) !== -1;
                    } else if (f.type === 'integrity') {
                        ok = integrity === f.val;
                    } else if (f.type === 'from') {
                        ok = from === f.name;
                    } else if (f.type === 'size') {
                        if (f.op === '>') ok = size > f.val;
                        else if (f.op === '<') ok = size < f.val;
                        else ok = size === f.val;
                    } else if (f.type === 'text') {
                        if (mode === 'File Name') {
                            ok = name.indexOf(f.text) !== -1;
                        } else if (mode === 'File Text') {
                            ok = contentLower.indexOf(f.text) !== -1;
                        } else if (mode === 'File Content') {
                            ok = hexContent.indexOf(f.text) !== -1;
                        } else {
                            ok = name.indexOf(f.text) !== -1 || contentLower.indexOf(f.text) !== -1 || hexContent.indexOf(f.text) !== -1;
                        }
                    } else if (f.type === 'all') {
                        ok = true;
                    }
                    if (f.neg) ok = !ok;
                    if (!ok) { clauseOk = false; break; }
                }
                if (clauseOk) return true;
            }
            return false;
        }

        _scoreEntryAgainstQuery(entry, query, mode) {
            const q = (query || '').toString().toLowerCase();
            if (q === '*') return 1;
            if (mode === 'File Name') {
                const name = entry.file.toLowerCase();
                if (name === q) return 1;
                const max = Math.max(name.length, q.length);
                if (max === 0) return 1;
                const dist = this._lev(name, q);
                return 1 - (dist / max);
            } else if (mode === 'File Text') {
                const content = (entry.content || '').toString().toLowerCase();
                if (content === q) return 1;
                const max = Math.max(content.length, q.length);
                if (max === 0) return 1;
                const dist = this._lev(content, q);
                return 1 - (dist / max);
            } else if (mode === 'File Content') {
                const hex = this._toHex(entry.content || '');
                if (hex === q) return 1;
                const max = Math.max(hex.length, q.length);
                if (max === 0) return 1;
                const dist = this._lev(hex, q);
                return 1 - (dist / max);
            } else {
                return this._scoreEntryAgainstQuery(entry, query, 'File Name');
            }
        }

        _lev(a, b) {
            const m = a.length, n = b.length;
            const dp = new Array(m + 1);
            for (let i = 0; i <= m; i++) {
                dp[i] = new Array(n + 1);
                dp[i][0] = i;
            }
            for (let j = 0; j <= n; j++) dp[0][j] = j;
            for (let i = 1; i <= m; i++) {
                for (let j = 1; j <= n; j++) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
                }
            }
            return dp[m][n];
        }

        async _localSearchEntries(query, mode) {
            const res = [];
            const orClauses = this._parseQueryToOrClauses(query || '');
            const fileNames = Object.keys(this.files);
            for (let i = 0; i < fileNames.length; i++) {
                const name = fileNames[i];
                const e = this.files[name];
                const entry = { file: name, integrity: e.integrity || this._getIntegrity(e.content || ''), sizeBits: e.sizeBits || ((e.content || '').length * 8), from: e.from, content: e.content };
                if (this._entryMatchesOrClauses(entry, orClauses, mode)) {
                    entry.score = this._scoreEntryAgainstQuery(entry, query, mode);
                    res.push(entry);
                }
                if (i % 1000 === 0) await new Promise(r => setTimeout(r, 0));
            }
            return res;
        }

        _toHex(str) {
            const encoder = new TextEncoder();
            const bytes = encoder.encode(str || '');
            let out = '';
            for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
            return out;
        }

        async search(args) {
            await this._makeSureConnected();
            const queryRaw = (args.THING || '').toString();
            const mode = args.MODE || 'File Name';
            const sid = 's' + (this._nextSearchId++);
            this.searchResponses[sid] = [];
            const msg = new Paho.MQTT.Message(JSON.stringify({
                type: 'search',
                query: queryRaw,
                from: this.displayName,
                searchId: sid,
                mode: mode
            }));
            msg.destinationName = 'FilePile/' + this.room;
            try { if (this.client) this.client.send(msg); } catch (e) { }
            const baseTime = this.MinSearchTime * 1000;
            const start = Date.now();
            let timeout = baseTime;
            while (true) {
                await new Promise(r => setTimeout(r, timeout));
                const count = (this.searchResponses[sid] || []).length;
                const extraSec = Math.min(59, Math.floor(count / 50));
                if (extraSec > 0) {
                    timeout = baseTime + extraSec * 2000;
                } else {
                    break;
                }
                if ((Date.now() - start) > 60000 + baseTime) break;
            }
            const local = await this._localSearchEntries(queryRaw, mode);
            const remote = this.searchResponses[sid] || [];
            const combined = [];
            const seen = {};
            local.forEach(r => {
                const key = r.file + '::' + r.integrity;
                if (!seen[key]) { combined.push(r); seen[key] = true; }
            });
            remote.forEach(r => {
                if (!r.file || !r.integrity) return;
                const entry = { file: r.file, integrity: r.integrity, sizeBits: r.sizeBits || 0, from: r.from };
                const key = entry.file + '::' + entry.integrity;
                if (!seen[key]) {
                    entry.score = this._scoreEntryAgainstQuery(entry, queryRaw, mode);
                    combined.push(entry);
                    seen[key] = true;
                }
                if (r.file && r.from) {
                    this.fileSeeders[r.file] = this.fileSeeders[r.file] || {};
                    this.fileSeeders[r.file][r.from] = Date.now();
                }
            });
            combined.sort((a, b) => (b.score || 0) - (a.score || 0));
            const out = combined.map(e => e.file + ':' + e.integrity);
            delete this.searchResponses[sid];
            return out.join(", ");
        }

        _ensureDownloadObject(file, integrity, chunkSize) {
            if (!file || !integrity) return null;
            const key = file + '::' + integrity;
            if (!this.downloads[key]) {
                const seeders = this.fileSeeders[file] ? Object.keys(this.fileSeeders[file]).length : 0;
                const concurrency = Math.max(2, Math.min(12, Math.floor(Math.max(this.DEFAULT_CONCURRENCY, seeders * 2))));
                this.downloads[key] = {
                    file: file,
                    integrity: integrity,
                    chunkSize: chunkSize || this.MAX_CHUNK_BYTES,
                    totalChunks: null,
                    received: {},
                    receivedCount: 0,
                    paused: false,
                    retries: {},
                    requestedTimers: {},
                    outstanding: {},
                    speedHistory: [],
                    lastChunkTime: null,
                    lastChunkBytes: null,
                    inactivityTimer: null,
                    completionPoll: null,
                    lastProgressCount: 0,
                    lastProgressTime: 0,
                    concurrency: concurrency
                };
            }
            return this.downloads[key];
        }

        async startDownload(args) {
            await this._makeSureConnected();
            let input = (args.FILENAME || '').toString();
            try {
                const parsed = JSON.parse(input);
                if (parsed && parsed.file && parsed.integrity) {
                    const file = parsed.file;
                    const integrity = parsed.integrity;
                    const chunkSize = parsed.chunkSize || this.MAX_CHUNK_BYTES;
                    const dl = this._ensureDownloadObject(file, integrity, chunkSize);
                    if (!dl) return;
                    if (parsed.totalChunks) dl.totalChunks = parsed.totalChunks;
                    if (parsed.received) {
                        dl.received = parsed.received;
                        dl.receivedCount = Object.keys(dl.received).length;
                    }
                    dl.paused = false;
                    dl.lastProgressCount = dl.receivedCount || 0;
                    dl.lastProgressTime = Date.now();
                    this._requestNextChunks(dl);
                    return;
                }
            } catch (e) { }
            let name = input;
            let wantedIntegrity = null;
            if (name.indexOf(':') !== -1) {
                const parts = name.split(':');
                wantedIntegrity = parts.pop();
                name = parts.join(':');
            }
            if (wantedIntegrity) {
                if (this.files[name] && this.files[name].integrity && this.files[name].integrity !== wantedIntegrity) return;
            }
            const attemptStart = async () => {
                if (wantedIntegrity == null) {
                    const res = await this.search({ THING: name, MODE: 'File Name' });
                    const arr = res.split(',').map(x => x.trim()).filter(x => x);
                    if (arr.length === 0) return null;
                    const first = arr[0];
                    if (!first.startsWith(name)) return null;
                    wantedIntegrity = first.split(':')[1];
                }
                if (this.files[name] && this.files[name].integrity && this.files[name].integrity === wantedIntegrity) return null;
                const dl = this._ensureDownloadObject(name, wantedIntegrity, this.MAX_CHUNK_BYTES);
                if (!dl) return null;
                dl.paused = false;
                dl.totalChunks = null;
                dl.lastProgressCount = dl.receivedCount || 0;
                dl.lastProgressTime = Date.now();
                this._requestNextChunks(dl);
                if (dl.completionPoll) {
                    clearInterval(dl.completionPoll);
                    dl.completionPoll = null;
                }
                dl.completionPoll = setInterval(() => {
                    const cur = this.downloads[name + '::' + wantedIntegrity];
                    if (!cur) {
                        clearInterval(dl.completionPoll);
                        return;
                    }
                    const progress = cur.receivedCount || 0;
                    if (progress === (cur.lastProgressCount || 0)) {
                        if (Date.now() - (cur.lastProgressTime || 0) > 2000) {
                            cur.lastChunkTime = null;
                            cur.lastChunkBytes = null;
                        }
                    } else {
                        cur.lastProgressCount = progress;
                        cur.lastProgressTime = Date.now();
                    }
                }, 500);
                return dl;
            };
            let dl = await attemptStart();
            if (dl) return;
            if (this.polls[name]) return;
            this.polls[name] = setInterval(async () => {
                const d = await attemptStart();
                if (d) {
                    clearInterval(this.polls[name]);
                    delete this.polls[name];
                }
            }, 10000);
        }

        _requestNextChunks(dl) {
            if (!dl || dl.paused) return;
            const concurrency = dl.concurrency || this.DEFAULT_CONCURRENCY;
            if (!dl.outstanding) dl.outstanding = {};
            let outstandingCount = Object.keys(dl.outstanding || {}).length;
            const tryFill = () => {
                while (outstandingCount < concurrency) {
                    let next = -1;
                    if (dl.totalChunks != null) {
                        for (let i = 0; i < dl.totalChunks; i++) {
                            if (!dl.received[i] && !dl.outstanding[i]) { next = i; break; }
                        }
                        if (next === -1) break;
                    } else {
                        let i = 0;
                        while (dl.received[i] || dl.outstanding[i]) i++;
                        next = i;
                    }
                    outstandingCount++;
                    dl.outstanding[next] = true;
                    dl.retries[next] = dl.retries[next] || 0;
                    const payload = { type: 'request', file: dl.file, integrity: dl.integrity, from: this.displayName, chunkIndex: next };
                    const msg = new Paho.MQTT.Message(JSON.stringify(payload));
                    msg.destinationName = 'FilePile/' + this.room;
                    try { if (this.client) this.client.send(msg); } catch (e) { }
                    const retryFn = () => {
                        if (!this.downloads[dl.file + '::' + dl.integrity]) return;
                        if (dl.retries[next] >= this.DEFAULT_RETRIES) {
                            if (dl.requestedTimers && dl.requestedTimers[next]) {
                                clearTimeout(dl.requestedTimers[next]);
                                delete dl.requestedTimers[next];
                            }
                            if (dl.outstanding && dl.outstanding[next]) delete dl.outstanding[next];
                            outstandingCount = Object.keys(dl.outstanding || {}).length;
                            return;
                        }
                        dl.retries[next]++;
                        const p = new Paho.MQTT.Message(JSON.stringify(payload));
                        p.destinationName = 'FilePile/' + this.room;
                        try { if (this.client) this.client.send(p); } catch (e) { }
                        dl.requestedTimers[next] = setTimeout(retryFn, 1500);
                    };
                    dl.requestedTimers[next] = setTimeout(retryFn, 1500);
                }
            };
            tryFill();
        }

        pauseDownload(args) {
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    this.downloads[k].paused = true;
                    for (const t in this.downloads[k].requestedTimers) {
                        clearTimeout(this.downloads[k].requestedTimers[t]);
                    }
                    this.downloads[k].requestedTimers = {};
                    this.downloads[k].outstanding = {};
                    if (this.downloads[k].completionPoll) { clearInterval(this.downloads[k].completionPoll); this.downloads[k].completionPoll = null; }
                    if (this.downloads[k].inactivityTimer) { clearTimeout(this.downloads[k].inactivityTimer); this.downloads[k].inactivityTimer = null; }
                }
            }
            if (this.polls[fname]) {
                clearInterval(this.polls[fname]);
                delete this.polls[fname];
            }
        }

        async resumeDownload(args) {
            await this._makeSureConnected();
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    dl.paused = false;
                    if (!dl.completionPoll) {
                        dl.completionPoll = setInterval(() => {
                            const cur = this.downloads[k];
                            if (!cur) return;
                            const progress = cur.receivedCount || 0;
                            if (progress === (cur.lastProgressCount || 0)) {
                                if (Date.now() - (cur.lastProgressTime || 0) > 2000) {
                                    cur.lastChunkTime = null;
                                    cur.lastChunkBytes = null;
                                }
                            } else {
                                cur.lastProgressCount = progress;
                                cur.lastProgressTime = Date.now();
                            }
                        }, 500);
                    }
                    this._requestNextChunks(dl);
                }
            }
        }

        cancelDownload(args) {
            const fname = (args.FILENAME || '').toString();
            for (const k in Object.assign({}, this.downloads)) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    if (dl && dl.requestedTimers) for (const t in dl.requestedTimers) clearTimeout(dl.requestedTimers[t]);
                    if (dl && dl.completionPoll) clearInterval(dl.completionPoll);
                    if (dl && dl.inactivityTimer) clearTimeout(dl.inactivityTimer);
                    delete this.downloads[k];
                }
            }
            if (this.polls[fname]) {
                clearInterval(this.polls[fname]);
                delete this.polls[fname];
            }
        }

        exportDownload(args) {
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    const exported = {
                        file: dl.file,
                        integrity: dl.integrity,
                        chunkSize: dl.chunkSize,
                        totalChunks: dl.totalChunks,
                        received: dl.received || {}
                    };
                    return JSON.stringify(exported);
                }
            }
            return '{}';
        }

        async importDownload(args) {
            await this._makeSureConnected();
            const json = (args.JSON || '').toString();
            try {
                const parsed = JSON.parse(json);
                if (!parsed.file || !parsed.integrity) return;
                const dl = this._ensureDownloadObject(parsed.file, parsed.integrity, parsed.chunkSize || this.MAX_CHUNK_BYTES);
                if (!dl) return;
                if (parsed.totalChunks) dl.totalChunks = parsed.totalChunks;
                if (parsed.received) {
                    dl.received = parsed.received;
                    dl.receivedCount = Object.keys(dl.received).length;
                }
                dl.paused = false;
                this._requestNextChunks(dl);
            } catch (e) { }
        }

        listDownloads() {
            const out = [];
            for (const k in this.downloads) {
                if (k.indexOf('::') === -1) continue;
                const d = this.downloads[k];
                if (!d || !d.file || !d.integrity) continue;
                out.push(d.file + ':' + d.integrity);
            }
            return out.join(", ");
        }

        estimateSpeed(args) {
            const fname = (args.FILENAME || '').toString();
            for (const k in this.downloads) {
                if (k.indexOf(fname + '::') === 0) {
                    const dl = this.downloads[k];
                    if (!dl.lastChunkTime) return 0;
                    if (!dl.speedHistory || dl.speedHistory.length === 0) return 0;
                    const sum = dl.speedHistory.reduce((a, b) => a + b, 0);
                    const avg = sum / dl.speedHistory.length;
                    return Math.round(avg);
                }
            }
            return 0;
        }

        activeFiles() {
            const keys = Object.keys(this.files || {});
            return keys.join(", ");
        }

        getRoom() {
            return this.room;
        }

        async setRoom(args) {
            await this._makeSureConnected();
            this.room = args.KEY;
            try { if (this.client) this.client.subscribe('FilePile/' + this.room); } catch (e) { }
        }

        changeMinSearchTime(args) {
            this.MinSearchTime = args.TIME;
        }

        addFile(args) {
            const name = this._sanitizeString(args.NAME || '');
            if (!name) return;
            const format = (args.FORMAT || 'Raw');
            const rawContent = (args.CONTENT || '').toString();
            let content = '';
            if (format === 'Raw') content = rawContent;
            else if (format === 'Hex') content = hexToString(rawContent);
            else if (format === 'Base64') content = fromBase64(rawContent);
            else if (format === 'Binary') content = binaryToString(rawContent);
            this.files[name] = {
                content,
                integrity: this._getIntegrity(content),
                from: this.displayName,
                sizeBits: (content || '').length * 8
            };
        }

        removeFile(args) {
            delete this.files[args.FILENAME];
        }

        removeFiles() {
            this.files = {};
        }

        progress(args) {
            const f = args.FILE;
            for (const k in this.downloads) {
                if (k.indexOf(f + '::') === 0) {
                    const dl = this.downloads[k];
                    const total = dl.totalChunks || 0;
                    const rec = dl.receivedCount || 0;
                    if (total > 0) return Math.floor((rec / total) * 100);
                    return rec > 0 ? 1 : 0;
                }
            }
            if (this.files[f]) return 100;
            return 0;
        }

        getFile(args) {
            const f = (args.FILENAME || '').toString();
            const format = (args.FORMAT || 'Raw');
            if (!this.files[f]) return '';
            const content = this.files[f].content || '';
            if (format === 'Raw') return content;
            if (format === 'Hex') return stringToHex(content);
            if (format === 'Base64') return toBase64(content);
            if (format === 'Binary') return stringToBinary(content);
            return content;
        }

        setDisplayName(args) {
            this.displayName = args.DISPLAYNAME;
        }

        async currentSeeders() {
            await this._makeSureConnected();
            this._pruneSeeders();
            var seeders = Object.keys(this.seeders).filter(item => item !== this.displayName);
            return seeders.join(", ");
        }

        computeIntegrity(args) {
            return this._getIntegrity((args.CONTENT || '').toString());
        }
    }

    Scratch.extensions.register(new FilePile());
})(Scratch);
