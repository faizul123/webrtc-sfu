if (location.href.substr(0, 5) !== 'https') location.href = 'https' + location.href.substr(4, location.href.length - 4)

const socket = io()

let producer = null

const videoOnloadHandler = () => {
  const username = 'user_' + Math.round(Math.random() * 1000);
  const urlObject = new URL(document.location.href);
  const params = urlObject.searchParams;
  const roomId = params.get("roomId");
  console.log({username, roomId});
  joinRoom(username, roomId);
}

const startCam = () => {
  if(!rc) return null;
  rc.produce(RoomClient.mediaType.video, mediaDevices.video[0]);
  rc.produce(RoomClient.mediaType.audio, mediaDevices.audio[0]);
}

//nameInput.value = 'user_' + Math.round(Math.random() * 1000)

socket.request = function request(type, data = {}) {
  return new Promise((resolve, reject) => {
    socket.emit(type, data, (data) => {
      if (data.error) {
        reject(data.error)
      } else {
        resolve(data)
      }
    })
  })
}

let rc = null

function joinRoom(name, room_id) {
  if (rc && rc.isOpen()) {
    console.log('Already connected to a room')
  } else {
    initEnumerateDevices()
    const localMedia = document.querySelector("#localMedia");
    const remoteVideos = document.querySelector("#remoteVideos");
    const remoteAudios = document.querySelector("#remoteAudios");
    rc = new RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen)
    addListeners()
  }
}

function roomOpen() {
  // login.className = 'hidden'
  // reveal(startAudioButton)
  // hide(stopAudioButton)
  // reveal(startVideoButton)
  // hide(stopVideoButton)
  // reveal(startScreenButton)
  // hide(stopScreenButton)
  // reveal(exitButton)
  // reveal(copyButton)
  // reveal(devicesButton)
  // control.className = ''
  // reveal(videoMedia)
  console.log("joined in a room ");
}

function hide(elem) {
  elem.className = 'hidden'
}

function reveal(elem) {
  elem.className = ''
}

function addListeners() {
  rc.on(RoomClient.EVENTS.startScreen, () => {
    hide(startScreenButton)
    reveal(stopScreenButton)
  })

  rc.on(RoomClient.EVENTS.stopScreen, () => {
    hide(stopScreenButton)
    reveal(startScreenButton)
  })

  rc.on(RoomClient.EVENTS.stopAudio, () => {
    // hide(stopAudioButton)
    // reveal(startAudioButton)
    console.log("audio stopped");
  })
  rc.on(RoomClient.EVENTS.startAudio, () => {
    // hide(startAudioButton)
    // reveal(stopAudioButton)
    console.log("audio started");
  })

  rc.on(RoomClient.EVENTS.startVideo, () => {
    // hide(startVideoButton)
    // reveal(stopVideoButton)
    console.log("video started")
  })
  rc.on(RoomClient.EVENTS.stopVideo, () => {
    // hide(stopVideoButton)
    // reveal(startVideoButton)
    console.log("video stopped");
  })
  rc.on(RoomClient.EVENTS.exitRoom, () => {
    // hide(control)
    // hide(devicesList)
    // hide(videoMedia)
    // hide(copyButton)
    // hide(devicesButton)
    // reveal(login)
    console.log("video closed");
  })
}

let isEnumerateDevices = false

function initEnumerateDevices() {
  // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
  if (isEnumerateDevices) return

  const constraints = {
    audio: true,
    video: true
  }

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      enumerateDevices()
      stream.getTracks().forEach(function (track) {
        track.stop()
      })
    })
    .catch((err) => {
      console.error('Access denied for audio/video: ', err)
    })
}
const mediaDevices ={
  audio:[], video: []
}

 enumerateDevices = () => {
  // Load mediaDevice options
  navigator.mediaDevices.enumerateDevices().then((devices) =>
    devices.forEach((device) => {
      if ('audioinput' === device.kind) {
        mediaDevices.audio.push(device);
      } else if ('videoinput' === device.kind) {
        mediaDevices.audio.push(device);
      }

      isEnumerateDevices = true
    })
  )
}
