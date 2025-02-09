let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const audioElement = document.getElementById('audio');

startButton.addEventListener('click', async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Seu dispositivo não suporta gravação de áudio.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (typeof MediaRecorder === "undefined") {
      alert("MediaRecorder não é suportado neste navegador.");
      return;
    }

    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    audioChunks = []; // Limpa os chunks antes de começar a nova gravação

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioElement.src = audioUrl;
      } else {
        console.error("Nenhum áudio foi gravado.");
      }
    };

    mediaRecorder.start();
    startButton.disabled = true;
    stopButton.disabled = false;
  } catch (error) {
    console.error("Erro ao acessar o microfone:", error);
    alert("Erro ao acessar o microfone.");
  }
});

stopButton.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  startButton.disabled = false;
  stopButton.disabled = true;
});
