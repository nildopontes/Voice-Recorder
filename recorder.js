var startButton, recorder, records, xTouchStart, xTouchEnd, touchedId;
   
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
   wrap.setAttribute('ontouchstart', 'touchStartRec(' + id + ')');
   wrap.setAttribute('ontouchmove', 'touchMoveRec()');
   wrap.setAttribute('ontouchend', 'touchEndRec()');
   var rec = document.createElement('audio');
   var timestamp = new Date().getTime();
   rec.setAttribute('src', 'server/records/rec-' + id + '.oga?t=' + timestamp);
   rec.setAttribute('controls', '');
   wrap.appendChild(rec);
   records.appendChild(wrap);
}
function removeRecord(id){
   document.getElementById('id' + id).remove();
   sendCommand('delete', id);
}
function getAllRecords(allData){
   var count = allData.length;
   for(var i = 0; i < count; i++){
      if(allData[i] == '1'){
         showRecord(i);
      }
   }
}
function touchStartRec(id){
   touchedId = id;
   xTouchStart = event.touches[0].clientX;
}
function touchMoveRec(){
   xTouchEnd = event.touches[0].clientX;
   document.getElementById('id' + touchedId).style.marginLeft = xTouchEnd - xTouchStart + 'px';
   document.getElementById('id' + touchedId).style.opacity = 1 - ((xTouchEnd - xTouchStart) / window.innerWidth);
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
   document.getElementById('id' + id).style.marginLeft = '0px';
   document.getElementById('id' + id).style.opacity = 1;
}
