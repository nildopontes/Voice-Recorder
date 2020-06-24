var mainBuffer = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var mediaStream = null;
var sampleRate = 0;
var context = null;
var blob = null;
var bufferSize = 2048;
var intervalSampleRate = 6;
   
document.addEventListener("DOMContentLoaded", function(e){
   var startRecordingButton = document.getElementById("startRecordingButton");
   var stopRecordingButton = document.getElementById("stopRecordingButton");
   var playButton = document.getElementById("playButton");
   var downloadButton = document.getElementById("downloadButton");
   var ctx = window.AudioContext || window.webkitAudioContext || false;
   if(ctx){
      ctx = new AudioContext();
      var sampleRate = ctx.sampleRate;
      for(var i = 3; i <= 6; i++){
         document.getElementById('sampleRate').innerHTML += '<option value="' + i + '"  selected>' + (sampleRate / i) + ' Hz</option>\n';
      }
      sampleRate /= 6;
   }else{
      alert('Seu navegador não é compatível com este sistema. Atualize-o ou experimente outro.');
   }

   startRecordingButton.addEventListener("click", function(){
      // Initialize recorder
      startRecordingButton.classList.add('recording');
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      navigator.getUserMedia({audio: true},
      function(e){
         console.log("user consent");
         // creates the audio context
         window.AudioContext = window.AudioContext || window.webkitAudioContext;
         context = new AudioContext();
         // creates an audio node from the microphone incoming stream
         mediaStream = context.createMediaStreamSource(e);
         // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
         var numberOfInputChannels = 1;
         var numberOfOutputChannels = 1;
         if(context.createScriptProcessor){
            recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
         }
         recorder.onaudioprocess = function(e){
		    for(var i = 0; i < bufferSize; i += intervalSampleRate){
			   mainBuffer.push(e.inputBuffer.getChannelData(0)[i] * 127 + 127);
			}
         }
         // we connect the recorder
         mediaStream.connect(recorder);
         recorder.connect(context.destination);
      },
      function(e){
         console.error(e);
      });
   });

   stopRecordingButton.addEventListener("click", function(){
      // stop recording
      startRecordingButton.classList.remove('recording');
      recorder.disconnect(context.destination);
      mediaStream.disconnect(recorder);
      recordingLength = mainBuffer.length;
      // we create our wav file
      var buffer = new ArrayBuffer(44 + recordingLength);
      var view = new DataView(buffer);

      // RIFF chunk descriptor
      writeUTFBytes(view, 0, 'RIFF');
      view.setUint32(4, 44 + recordingLength, true);
      writeUTFBytes(view, 8, 'WAVE');
      // FMT sub-chunk
      writeUTFBytes(view, 12, 'fmt ');
      view.setUint32(16, 16, true); // chunkSize
      view.setUint16(20, 1, true); // wFormatTag
      view.setUint16(22, 1, true); // wChannels: stereo (2 channels)
      view.setUint32(24, sampleRate, true); // dwSamplesPerSec
      view.setUint32(28, sampleRate, true); // dwAvgBytesPerSec
      view.setUint16(32, 1, true); // wBlockAlign
      view.setUint16(34, 8, true); // wBitsPerSample
      // data sub-chunk
      writeUTFBytes(view, 36, 'data');
      view.setUint32(40, recordingLength, true);

      // write the PCM samples
      for(var i = 44; i < recordingLength; i++){
         view.setUint8(i, mainBuffer[i]);
      }

      // our final blob
      blob = new Blob([view], { type: 'audio/wav' });
   });

   playButton.addEventListener("click", function(){
      if (blob == null){
         return;
      }
      var url = window.URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio.play();
   });

   downloadButton.addEventListener("click", function(){
      if(blob == null){
         return;
      }
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "sample.wav";
      a.click();
      window.URL.revokeObjectURL(url);
   });
   
   document.getElementById('sampleRate').addEventListener("change", function(){
      intervalSampleRate = this.value;
   });
});
   function writeUTFBytes(view, offset, string){
      for(var i = 0; i < string.length; i++){
         view.setUint8(offset + i, string.charCodeAt(i));
      }
   }

