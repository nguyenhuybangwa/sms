/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var resultArr = [];
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var smsapp = {
    sendSms: function() {
        var number = document.getElementById('numberTxt').value.toString(); /* iOS: ensure number is actually a string */
        var message = document.getElementById('messageTxt').value;
        console.log("number=" + number + ", message= " + message);

        //CONFIGURATION
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                // intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }
        };

        var success = function () { alert('Message sent successfully'); };
        var error = function (e) { alert('Message Failed:' + e); };
        if (typeof sms === "undefined") {
            alert('not plugin');
        }else{
            alert('ok');
        }
        sms.send(number, message, options, success, error);
    },
    send: function(tel,msg){
        //CONFIGURATION
        var options = {
            replaceLineBreaks: true, // true to replace \n by a new line, false by default
            android: {
                // intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }

        };
        var success = function () {
            // Ghi vao lich su
            resultArr.push('Replay thanh cong toi');
            showResult();
            // alert('Message sent successfully'); 
        };
        var error = function (e) { alert('Message Failed:' + e); };
        sms.send(tel, msg, options, success, error);
    },
    sends: function (datas) {
        //CONFIGURATION
        var options = {
            replaceLineBreaks: true, // true to replace \n by a new line, false by default
            android: {
                // intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }

        };
        var success = function () {
            // Ghi vao lich su
            resultArr.push('Send to: ' + datas[0].tel + ' voi noi dung: ' + datas[0].msg);
            showResult();

            datas.splice(0,1);
            if(datas.length > 0){
                setTimeout(function () {
                    sms.send(datas[0].tel, datas[0].msg, options, success, error);
                },1500)
            }
        };
        var error = function (e) { 
            resultArr.push('Message Failed to : ' + datas[0].tel + ' voi noi dung: ' + e);
            showResult();

            datas.splice(0,1);
            if(datas.length > 0){
                sms.send(datas[0].tel, datas[0].msg, options, success, error);
            }

            // alert('Message Failed:' + e); 
        };

        sms.send(datas[0].tel, datas[0].msg, options, success, error);
    }
};

function kiemtra() {
    if(typeof SmsReceiver === "undefined"){
        alert('ko ton tai');
    }else{
        alert('ton tai');
    }


    SmsReceiver.isSupported((supported) => {
      if (supported) {
        alert("SMS supported!")
      } else {
        alert("SMS not supported")
      }
    }, () => {
      alert("Error while checking the SMS support")
    })
}

function startSms() {
    SmsReceiver.startReception(pushMsgs, () => {
      alert("Error while receiving messages")
    })
}

function pushMsgs(smsObj) {
    // Ghi vao lich su
    resultArr.push('Nhan tu: ' + smsObj.originatingAddress + ' noi dung: ' + smsObj.messageBody);
    showResult();

    // gui len server
    var url = "http://dev.mode-life.net/api/push-msgs";
    $.post(url,{tel: smsObj.originatingAddress, msg: smsObj.messageBody},function(resData){
        if(resData.replayText !== undefined && resData.replayText != ''){
            // replay lai
            smsapp.send(smsObj.originatingAddress,resData.replayText);
        }
        // console.log(resData);
    },"json").fail(function() {
        resultArr.push('ajax fail in pushMsgs');
        showResult();
        // console.log('ajax fail in pushMsgs');
        // console.log('error');
    });
}

function startInBackground() {
    cordova.plugins.backgroundMode.enable();
    pushMsgsLoop();

    setInterval(pushMsgsLoop,20000);
}

function pushMsgsLoop() {
    var url = "http://dev.mode-life.net/api/push-msgs";
    $.get(url,function(resData){
        if(resData.datas !== undefined && resData.datas.length > 0){
            // Send msg
            smsapp.sends(resData.datas);
        }
        // console.log(resData);
    },"json").fail(function() {
        resultArr.push('ajax fail in pushMsgsLoop');
        showResult();
    });
}

function showResult() {
    if(resultArr.length > 0){
        var resultHtml = '<ul>';
        for(var x of resultArr){
            resultHtml += `<li>${x}</li>`;
        }
        resultHtml += `</ul>`;

        $('#result').html(resultHtml);
    }
}

function startSms1() {
    SmsReceiver.startReception(({messageBody, originatingAddress}) => {
      alert(messageBody)
    }, () => {
      alert("Error while receiving messages")
    })
}


