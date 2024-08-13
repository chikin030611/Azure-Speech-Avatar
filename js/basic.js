// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.

// Global objects
var avatarSynthesizer
var peerConnection
var previousAnimationFrameTimestamp = 0;

// Logger
const log = msg => {
    document.getElementById('logging').innerHTML += msg + '<br>'
}

// Setup WebRTC
function setupWebRTC(iceServerUrl, iceServerUsername, iceServerCredential) {
    // Create WebRTC peer connection
    peerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: [ iceServerUrl ],
            username: iceServerUsername,
            credential: iceServerCredential
        }]
    })

    // Fetch WebRTC video stream and mount it to an HTML video element
    peerConnection.ontrack = function (event) {
        // Clean up existing video element if there is any
        remoteVideoDiv = document.getElementById('remoteVideo')
        for (var i = 0; i < remoteVideoDiv.childNodes.length; i++) {
            if (remoteVideoDiv.childNodes[i].localName === event.track.kind) {
                remoteVideoDiv.removeChild(remoteVideoDiv.childNodes[i])
            }
        }

        const mediaPlayer = document.createElement(event.track.kind)
        mediaPlayer.id = event.track.kind
        mediaPlayer.srcObject = event.streams[0]
        mediaPlayer.autoplay = true
        document.getElementById('remoteVideo').appendChild(mediaPlayer)
        document.getElementById('videoLabel').hidden = true
        document.getElementById('overlayArea').hidden = false

        if (event.track.kind === 'video') {
            mediaPlayer.playsInline = true
            remoteVideoDiv = document.getElementById('remoteVideo')
            canvas = document.getElementById('canvas')
            if (document.getElementById('transparentBackground').checked) {
                remoteVideoDiv.style.width = '0.1px'
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                canvas.hidden = false
            } else {
                canvas.hidden = true
            }

            mediaPlayer.addEventListener('play', () => {
                if (document.getElementById('transparentBackground').checked) {
                    window.requestAnimationFrame(makeBackgroundTransparent)
                } else {
                    remoteVideoDiv.style.width = mediaPlayer.videoWidth / 2.5 + 'px'
                }
            })
        }
        else
        {
            // Mute the audio player to make sure it can auto play, will unmute it when speaking
            // Refer to https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
            mediaPlayer.muted = true
        }
    }

    // Make necessary update to the web page when the connection state changes
    peerConnection.oniceconnectionstatechange = e => {
        log("WebRTC status: " + peerConnection.iceConnectionState)

        if (peerConnection.iceConnectionState === 'connected') {
            document.getElementById('stopSession').disabled = false
            document.getElementById('speak').disabled = false
            document.getElementById('configuration').hidden = true
        }

        if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed') {
            document.getElementById('speak').disabled = true
            document.getElementById('stopSpeaking').disabled = true
            document.getElementById('stopSession').disabled = true
            document.getElementById('startSession').disabled = false
            document.getElementById('configuration').hidden = false
        }
    }

    // Offer to receive 1 audio, and 1 video track
    peerConnection.addTransceiver('video', { direction: 'sendrecv' })
    peerConnection.addTransceiver('audio', { direction: 'sendrecv' })

    // start avatar, establish WebRTC connection
    avatarSynthesizer.startAvatarAsync(peerConnection).then((r) => {
        if (r.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log("[" + (new Date()).toISOString() + "] Avatar started. Result ID: " + r.resultId)
        } else {
            console.log("[" + (new Date()).toISOString() + "] Unable to start avatar. Result ID: " + r.resultId)
            if (r.reason === SpeechSDK.ResultReason.Canceled) {
                let cancellationDetails = SpeechSDK.CancellationDetails.fromResult(r)
                if (cancellationDetails.reason === SpeechSDK.CancellationReason.Error) {
                    console.log(cancellationDetails.errorDetails)
                };
                log("Unable to start avatar: " + cancellationDetails.errorDetails);
            }
            document.getElementById('startSession').disabled = false;
            document.getElementById('configuration').hidden = false;
        }
    }).catch(
        (error) => {
            console.log("[" + (new Date()).toISOString() + "] Avatar failed to start. Error: " + error)
            document.getElementById('startSession').disabled = false
            document.getElementById('configuration').hidden = false
        }
    );
}

// Make video background transparent by matting
function makeBackgroundTransparent(timestamp) {
    // Throttle the frame rate to 30 FPS to reduce CPU usage
    if (timestamp - previousAnimationFrameTimestamp > 30) {
        video = document.getElementById('video')
        tmpCanvas = document.getElementById('tmpCanvas')
        tmpCanvasContext = tmpCanvas.getContext('2d', { willReadFrequently: true })
        tmpCanvasContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        if (video.videoWidth > 0) {
            let frame = tmpCanvasContext.getImageData(0, 0, video.videoWidth, video.videoHeight)
            for (let i = 0; i < frame.data.length / 4; i++) {
                let r = frame.data[i * 4 + 0]
                let g = frame.data[i * 4 + 1]
                let b = frame.data[i * 4 + 2]
                if (g - 150 > r + b) {
                    // Set alpha to 0 for pixels that are close to green
                    frame.data[i * 4 + 3] = 0
                } else if (g + g > r + b) {
                    // Reduce green part of the green pixels to avoid green edge issue
                    adjustment = (g - (r + b) / 2) / 3
                    r += adjustment
                    g -= adjustment * 2
                    b += adjustment
                    frame.data[i * 4 + 0] = r
                    frame.data[i * 4 + 1] = g
                    frame.data[i * 4 + 2] = b
                    // Reduce alpha part for green pixels to make the edge smoother
                    a = Math.max(0, 255 - adjustment * 4)
                    frame.data[i * 4 + 3] = a
                }
            }

            canvas = document.getElementById('canvas')
            canvasContext = canvas.getContext('2d')
            canvasContext.putImageData(frame, 0, 0);
        }

        previousAnimationFrameTimestamp = timestamp
    }

    window.requestAnimationFrame(makeBackgroundTransparent)
}
// Do HTML encoding on given text
function htmlEncode(text) {
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };

    return String(text).replace(/[&<>"'\/]/g, (match) => entityMap[match])
}

window.startSession = () => {
    const cogSvcRegion = document.getElementById('region').value
    const cogSvcSubKey = document.getElementById('subscriptionKey').value
    if (cogSvcSubKey === '') {
        alert('Please fill in the subscription key of your speech resource.')
        return
    }

    const privateEndpointEnabled = document.getElementById('enablePrivateEndpoint').checked
    const privateEndpoint = document.getElementById('privateEndpoint').value.slice(8)
    if (privateEndpointEnabled && privateEndpoint === '') {
        alert('Please fill in the Azure Speech endpoint.')
        return
    }

    let speechSynthesisConfig
    if (privateEndpointEnabled) {
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromEndpoint(new URL(`wss://${privateEndpoint}/tts/cognitiveservices/websocket/v1?enableTalkingAvatar=true`), cogSvcSubKey) 
    } else {
        speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion)
    }
    speechSynthesisConfig.endpointId = document.getElementById('customVoiceEndpointId').value

    const videoFormat = new SpeechSDK.AvatarVideoFormat()
    let videoCropTopLeftX = document.getElementById('videoCrop').checked ? 600 : 0
    let videoCropBottomRightX = document.getElementById('videoCrop').checked ? 1320 : 1920
    videoFormat.setCropRange(new SpeechSDK.Coordinate(videoCropTopLeftX, 0), new SpeechSDK.Coordinate(videoCropBottomRightX, 1080));

    const talkingAvatarCharacter = document.getElementById('talkingAvatarCharacter').value
    const talkingAvatarStyle = document.getElementById('talkingAvatarStyle').value
    const avatarConfig = new SpeechSDK.AvatarConfig(talkingAvatarCharacter, talkingAvatarStyle, videoFormat)
    avatarConfig.customized = document.getElementById('customizedAvatar').checked
    avatarConfig.backgroundColor = document.getElementById('backgroundColor').value
    avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechSynthesisConfig, avatarConfig)
    avatarSynthesizer.avatarEventReceived = function (s, e) {
        var offsetMessage = ", offset from session start: " + e.offset / 10000 + "ms."
        if (e.offset === 0) {
            offsetMessage = ""
        }
        console.log("[" + (new Date()).toISOString() + "] Event received: " + e.description + offsetMessage)
    }

    document.getElementById('startSession').disabled = true
    
    const xhr = new XMLHttpRequest()
    if (privateEndpointEnabled) {
        xhr.open("GET", `https://${privateEndpoint}/tts/cognitiveservices/avatar/relay/token/v1`)
    } else {
        xhr.open("GET", `https://${cogSvcRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`)
    }
    xhr.setRequestHeader("Ocp-Apim-Subscription-Key", cogSvcSubKey)
    xhr.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {
            const responseData = JSON.parse(this.responseText)
            const iceServerUrl = responseData.Urls[0]
            const iceServerUsername = responseData.Username
            const iceServerCredential = responseData.Password
            setupWebRTC(iceServerUrl, iceServerUsername, iceServerCredential)
        }
    })
    xhr.send()
    
}

window.speak = (text) => {
    document.getElementById('speak').disabled = true;
    document.getElementById('stopSpeaking').disabled = false
    document.getElementById('audio').muted = false
    // let spokenText = document.getElementById('spokenText').value
    let spokenText = text
    let ttsVoice = document.getElementById('ttsVoice').value
    let personalVoiceSpeakerProfileID = document.getElementById('personalVoiceSpeakerProfileID').value
    let spokenSsml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='en-US'><voice name='${ttsVoice}'><mstts:ttsembedding speakerProfileId='${personalVoiceSpeakerProfileID}'><mstts:leadingsilence-exact value='0'/>${htmlEncode(spokenText)}</mstts:ttsembedding></voice></speak>`
    console.log("[" + (new Date()).toISOString() + "] Speak request sent.")
    avatarSynthesizer.speakSsmlAsync(spokenSsml).then(
        (result) => {
            document.getElementById('speak').disabled = false
            document.getElementById('stopSpeaking').disabled = true
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                console.log("[" + (new Date()).toISOString() + "] Speech synthesized to speaker for text [ " + spokenText + " ]. Result ID: " + result.resultId)
            } else {
                console.log("[" + (new Date()).toISOString() + "] Unable to speak text. Result ID: " + result.resultId)
                if (result.reason === SpeechSDK.ResultReason.Canceled) {
                    let cancellationDetails = SpeechSDK.CancellationDetails.fromResult(result)
                    console.log(cancellationDetails.reason)
                    if (cancellationDetails.reason === SpeechSDK.CancellationReason.Error) {
                        console.log(cancellationDetails.errorDetails)
                    }
                }
            }
        }).catch(log);
}


window.stopSpeaking = () => {
    document.getElementById('stopSpeaking').disabled = true

    avatarSynthesizer.stopSpeakingAsync().then(
        log("[" + (new Date()).toISOString() + "] Stop speaking request sent.")
    ).catch(log);
}

window.stopSession = () => {
    document.getElementById('speak').disabled = true
    document.getElementById('stopSession').disabled = true
    document.getElementById('stopSpeaking').disabled = true
    avatarSynthesizer.close()
}

window.updataTransparentBackground = () => {
    if (document.getElementById('transparentBackground').checked) {
        document.body.background = './image/background.png'
        document.getElementById('backgroundColor').value = '#00FF00FF'
        document.getElementById('backgroundColor').disabled = true
    } else {
        document.body.background = ''
        document.getElementById('backgroundColor').value = '#FFFFFFFF'
        document.getElementById('backgroundColor').disabled = false
    }
}

window.updatePrivateEndpoint = () => {
    if (document.getElementById('enablePrivateEndpoint').checked) {
        document.getElementById('showPrivateEndpointCheckBox').hidden = false
    } else {
        document.getElementById('showPrivateEndpointCheckBox').hidden = true
    }
}

window.askQuestion = function(question) {
    const qnaMap = {
        "海洋公園有咩園區？": "海洋公園有兩個主要樂園，第一個係「海濱樂園」，入面有「威威天地」、「亞洲動物天地」同「夢幻水都」；"
                    + "第二個係「高峰樂園」，入面有「滑浪飛船」、「熱帶激流」、「動感快車」、「翻天覆地」同「極速之旅 ── VR太空探索」。"
                    + "你可以選擇搭纜車或者海洋列車上去，沿途可以欣賞到壯觀嘅山海美景。",
        "海洋公園有啲咩玩？": "海洋公園有好多嘢玩㗎。小朋友可以喺「威威天地」玩「彈彈屋」、「幻彩旋轉馬」。"
                        + "到咗「高峰樂園」，你可以玩「滑浪飛船」、「動感快車」，仲有「極速之旅 ── VR太空探索」。"
                        + "鍾意動物嘅可以去「亞洲動物天地」睇大熊貓、「尋鯊探秘」睇鯊魚，仲有「冰極天地」睇企鵝。"
                        + "園內有互動體驗，可以近距離接觸動物，了解佢哋嘅日常生活同保護野生動物嘅知識。海洋公園有好多嘢等緊你慢慢發掘！",
        "海洋公園有啲咩食？": "喺海洋公園，你可以搵到好多唔同嘅食肆選擇。例如，喺「夢幻水都」區，有「海龍王餐廳」同「爐炭燒」兩間特色餐廳。"
                        + "另外，如果你想嘆啲輕鬆嘅小食，「香港老大街」嘅「歡樂小食」同「動感天地」嘅「動感美食坊」都係好選擇。",
        "海洋公園有啲咩動物？": "海洋公園有好多種動物，例如「澳洲歷奇」有無尾熊、「亞洲動物天地」有大熊貓，同「冰極天地」有企鵝，全部都好可愛！"
                        + "園內有互動體驗，可以近距離接觸動物，了解佢哋嘅生活同保護野生動物嘅知識。"
                        + "你可以喺「約會海象」摸海象、餵食；喺「豚聚一刻」同海豚玩水，甚至成為一小時嘅名譽大熊貓護理員。"
                        + "參加「神秘深海之夜」，可以喺「海洋奇觀」內露營，徹夜觀賞超過5000條魚，可以同鯆魚、鎚頭鯊相伴。"
    };

    // Get the question and answer based on the button pressed
    const answer = qnaMap[question];

    // Speak the answer
    speak(answer);

    // Update the message history
    const messageHistory = document.getElementById('messageHistory');
    messageHistory.innerHTML += `<div style="margin: 5px"><strong>Question:</strong> ${question}</div>`;
    messageHistory.innerHTML += `<div style="margin: 5px"><strong>Answer:</strong> ${answer}</div>`;

}

const STUN_URL = "stun:stun.sipsorcery.com";
const WEBSOCKET_URL = "ws://127.0.0.1:8081/"

var pc, ws;

async function startStreaming() {

    // // Request access to required audio/video capture devices.
    // var captureStm = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // document.querySelector('#videoCtl').srcObject = captureStm; // No remote streams so render local ones.

    // Get the video stream from the video element
    var captureStm = document.getElementById('video').captureStream(30);
    pc = new RTCPeerConnection({ iceServers: [{ urls: STUN_URL }] });

    log("WebRTC peer connection created.");

    //pc.ontrack = evt => document.querySelector('#videoCtl').srcObject = evt.streams[0];
    pc.onicecandidate = evt => evt.candidate && ws.send(JSON.stringify(evt.candidate));

    // Diagnostics.
    pc.onicegatheringstatechange = () => console.log("onicegatheringstatechange: " + pc.iceGatheringState);
    pc.oniceconnectionstatechange = () => console.log("oniceconnectionstatechange: " + pc.iceConnectionState);
    pc.onsignalingstatechange = () => console.log("onsignalingstatechange: " + pc.signalingState);
    pc.onconnectionstatechange = () => console.log("onconnectionstatechange: " + pc.connectionState);

    // Add local capture streams to peer connection.
    captureStm.getTracks().forEach(track => pc.addTrack(track, captureStm));

    // Web socket signaling.
    ws = new WebSocket(document.querySelector('#websockurl').value, []);
    ws.onmessage = async function (evt) {
        if (/^[\{"'\s]*candidate/.test(evt.data)) {
            pc.addIceCandidate(JSON.parse(evt.data));
        }
        else {
            await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(evt.data)));
            pc.createAnswer()
                .then((answer) => pc.setLocalDescription(answer))
                .then(() => ws.send(JSON.stringify(pc.localDescription)));
        }
    };
};

async function closePeer() {
    pc.getSenders().forEach(sender => {
        sender.track.stop();
        pc.removeTrack(sender);
    });
    await pc.close();
    await ws.close();
};