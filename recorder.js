var startButton, recorder, records, xTouchStart, xTouchEnd, touchedId = null;
   
document.addEventListener('DOMContentLoaded', function(e){
   startButton = document.getElementById('start');
   records = document.getElementById('records');
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
   xhr.open('POST','server/server.php', true);
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
   var wrap = document.createElement('div');
   wrap.setAttribute('id', 'id' + id);
   wrap.setAttribute('class', 'wrapRec');
   wrap.addEventListener('touchstart', touchStartRec);
   wrap.addEventListener('touchmove', touchMoveRec);
   wrap.addEventListener('touchend', touchEndRec);
   wrap.addEventListener('mousedown', touchStartRec);
   wrap.addEventListener('mousemove', touchMoveRec);
   wrap.addEventListener('mouseup', touchEndRec);
   var rec = document.createElement('audio');
   var timestamp = new Date().getTime();
   rec.setAttribute('src', 'server/records/rec-' + id + '.oga?t=' + timestamp);
   rec.setAttribute('controls', '');
   wrap.appendChild(rec);
   records.appendChild(wrap);
}
function removeRecord(id){
   document.getElementById(id).remove();
   sendCommand('delete', parseInt(id.substr(2), 10));
}
function getAllRecords(allData){
   var count = allData.length;
   for(var i = 0; i < count; i++){
      if(allData[i] == '1'){
         showRecord(i);
      }
   }
}
function touchStartRec(){
   touchedId = this.id;
   if(typeof event.touches === "undefined"){
      xTouchStart = event.clientX;
   }else{
      xTouchStart = event.touches[0].clientX;
   }
}
function touchMoveRec(){
   if(typeof event.touches === "undefined"){
      xTouchEnd = event.clientX;
   }else{
      xTouchEnd = event.touches[0].clientX;
   }
   if(touchedId != null){
      document.getElementById(touchedId).style.marginLeft = xTouchEnd - xTouchStart + 'px';
      document.getElementById(touchedId).style.opacity = 1 - ((xTouchEnd - xTouchStart) / window.innerWidth);
      if(xTouchEnd - xTouchStart > 100){
         touchEndRec();
      }
   }
}
function touchEndRec(){
   if(xTouchEnd - xTouchStart > 100){
      if(confirm('Tem certeza que deseja excluir?')){
         removeRecord(touchedId);
      }else{
         resetStyleRec(touchedId);
      }
   }else{
      resetStyleRec(touchedId);
   }
   touchedId = null;
   xTouchStart = 0;
   xTouchEnd = 0;
}
function resetStyleRec(id){
   document.getElementById(id).style.marginLeft = '0px';
   document.getElementById(id).style.opacity = 1;
}
