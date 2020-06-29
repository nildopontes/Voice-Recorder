var startButton, recorder, records;
   
document.addEventListener("DOMContentLoaded", function(e){
   startButton = document.getElementById("start");
   records = document.getElementById("records");
   navigator.mediaDevices.getUserMedia({
      audio: true
   }).then(function(stream){
      startButton.disabled = false;
      startButton.addEventListener('mousedown', startRecording);
      startButton.addEventListener('mouseup', stopRecording);
      startButton.addEventListener('touchstart', startRecording);
      startButton.addEventListener('touchend', stopRecording);
      var options = {
         audioBitsPerSecond : 16000,
         mimeType : 'audio/webm;codecs=opus'
      }
      recorder = new MediaRecorder(stream, options);
      recorder.addEventListener('dataavailable', onRecordingReady);
   });
   sendCommand('update', 0);
});
function startRecording(){
   recorder.start();
   console.log('Teste');
}
function stopRecording(){
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
   xhr.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
         if(command == 'update'){
            if(this.responseText.length > 0){
               getAllRecords(this.responseText);
            }
         }
         return(this.responseText);
      }
   };
   xhr.open('GET', 'server/server.php?cmd=' + command + '&id=' + value, true);
   xhr.send();
}
function showRecord(id){
   var rec = document.createElement("audio");
   var timestamp = new Date().getTime();
   rec.setAttribute('src', 'server/records/rec-' + id + '.oga?t=' + timestamp);
   rec.setAttribute('id', 'id' + id);
   rec.setAttribute('controls', '');
   records.appendChild(rec);
}
function getAllRecords(allData){
   var count = allData.length;
   for(var i = 0; i < count; i++){
      if(allData[i] == '1'){
         showRecord(i);
      }
   }
}
