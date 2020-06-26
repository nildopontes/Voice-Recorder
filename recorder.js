var startButton, stopButton, recorder;
   
document.addEventListener("DOMContentLoaded", function(e){
   startButton = document.getElementById("start");
   stopButton = document.getElementById("stop");
   navigator.mediaDevices.getUserMedia({
      audio: true
   }).then(function(stream){
      startButton.disabled = false;
      startButton.addEventListener('click', startRecording);
      stopButton.addEventListener('click', stopRecording);
      var options = {
         audioBitsPerSecond : 16000,
         mimeType : 'audio/webm;codecs=opus'
      }
      recorder = new MediaRecorder(stream, options);
      recorder.addEventListener('dataavailable', onRecordingReady);
   });
});
function startRecording(){
   startButton.classList.add('recording');
   startButton.disabled = true;
   stopButton.disabled = false;
   recorder.start();
}

function stopRecording(){
   startButton.classList.remove('recording');
   startButton.disabled = false;
   stopButton.disabled = true;
   recorder.stop();
}

function onRecordingReady(e){
   var audio = document.getElementById('audio');
   audio.src = URL.createObjectURL(e.data);
}
