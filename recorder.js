document.addEventListener("DOMContentLoaded", function(e){
   var startRecordingButton = document.getElementById("startRecordingButton");
   var stopRecordingButton = document.getElementById("stopRecordingButton");
   var playButton = document.getElementById("playButton");
   var downloadButton = document.getElementById("downloadButton");

   var mainBuffer = [];
   var tempBuffer;
   var recorder = null;
   var recordingLength = 0;
   var volume = null;
   var mediaStream = null;
   var sampleRate = 44100;
   var context = null;
   var blob = null;
   var bufferSize = 2048;

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
         // bufferSize: the onaudioprocess event is called when the buffer is full
         var numberOfInputChannels = 1;
         var numberOfOutputChannels = 1;
         if(context.createScriptProcessor){
            recorder = context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
         }
         recorder.onaudioprocess = function(e){
               mainBuffer.push(new Float32Array(e.inputBuffer.getChannelData(0)));
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
      recordingLength = mainBuffer.length * bufferSize;
      console.log(recordingLength);
      tempBuffer = flattenArray();
      recordingLength = tempBuffer.length;
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
      console.log(recordingLength);
      for(var i = 44; i < recordingLength; i++){
         view.setUint8(i, ((tempBuffer[i] * 127) + 127), true);
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

   function flattenArray(){
      var result = new Float32Array(recordingLength);
      var offset = 0;
      for(var i = 0; i < mainBuffer.length; i++){
         var buffer = mainBuffer[i];
         result.set(buffer, offset);
         offset += bufferSize;
      }
      return result;
   }

   function writeUTFBytes(view, offset, string){
      for(var i = 0; i < string.length; i++){
         view.setUint8(offset + i, string.charCodeAt(i));
      }
   }
});
