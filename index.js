let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const audioElement = document.getElementById('audio');

startButton.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioChunks = [];
    const audioUrl = URL.createObjectURL(audioBlob);
    audioElement.src = audioUrl;
  };

  mediaRecorder.start();
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
});
