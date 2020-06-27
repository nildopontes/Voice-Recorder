var startButton, stopButton, recorder, records;
   
document.addEventListener("DOMContentLoaded", function(e){
   startButton = document.getElementById("start");
   stopButton = document.getElementById("stop");
   records = document.getElementById("records");
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
   sendRecord(e.data);
}
function sendRecord(blob){
   var xhr = new XMLHttpRequest();
   xhr.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
         showRecord(this.responseText);
      }
   };
   xhr.open("POST","server/server.php", true);
   xhr.send(blob);
}
function sendCommand(command, value){
   var xhr = new XMLHttpRequest();
   xhr.open('GET', 'server/server.php?cmd=' + command + '&id=' + value, true);
   xhr.send();
}
function showRecord(id){
   var rec = document.createElement("audio");
   rec.setAttribute('src', 'server/records/rec-' + id + '.oga');
   rec.setAttribute('id', 'id' + id);
   rec.setAttribute('controls', '');
   records.appendChild(rec);
}
