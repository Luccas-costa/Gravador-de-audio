// Variáveis para controlar o estado da gravação
let audioContext;
let mediaStream;
let recorder;
let audioData = [];
let wavBlob;

// Seletores dos elementos HTML
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const audioElement = document.getElementById('audio');
const simulateFTPButton = document.getElementById('simulateFTP');

// Onclick ou seja evento para iniciar a gravação
startButton.addEventListener('click', async () => {
  startRecording();  // Função para iniciar a gravação
  startButton.disabled = true;
  stopButton.disabled = false;
  simulateFTPButton.disabled = true;
});

// Onclick ou seja evento para parar a gravação
stopButton.addEventListener('click', () => {
  stopRecording();  // Função para parar a gravação e gerar o arquivo WAV
  startButton.disabled = false;
  stopButton.disabled = true;
  simulateFTPButton.disabled = false;
});

// Onclick ou seja evento para simular o envio para o FTP e retornar um link
simulateFTPButton.addEventListener('click', () => {
  simulateFTPUpload();
});

// ----------------------------------------------
// Função para iniciar a gravação de áudio
// ----------------------------------------------
async function startRecording() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(mediaStream);
  recorder = audioContext.createScriptProcessor(4096, 1, 1);

  // Limpa os dados de áudio para uma nova gravação
  audioData = [];

  // Captura os dados de áudio a cada processamento
  recorder.onaudioprocess = (event) => {
    const data = event.inputBuffer.getChannelData(0);
    audioData.push(new Float32Array(data));
  };

  // Conecta o gravador ao fluxo de áudio
  source.connect(recorder);
  recorder.connect(audioContext.destination);
}

// ----------------------------------------------
// Função para parar a gravação e gerar um arquivo WAV
// ----------------------------------------------
function stopRecording() {
  recorder.disconnect();
  audioContext.close();
  mediaStream.getTracks().forEach(track => track.stop());

  // Cria o arquivo WAV a partir dos dados de áudio
  // CIRA O ARQUIVO
  wavBlob = createWAV(audioData);

  // NAO USADO POR CAUSA DO FTP
  // Exibe o áudio no player usando um Object URL
  // const audioUrl = URL.createObjectURL(wavBlob);
  // audioElement.src = audioUrl;
}

// ----------------------------------------------
// Função para simular o upload para um servidor FTP
// ----------------------------------------------
function simulateFTPUpload() {
  // Simula o upload para o FTP baixando o arquivo para a máquina do usuário
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(wavBlob);
  downloadLink.download = 'simulated_ftp_upload.wav';
  downloadLink.click();

  // Após o "upload", simula o link do arquivo no FTP
  setTimeout(() => {
    const ftpLink = URL.createObjectURL(wavBlob);  // Simula o link que o FTP retornaria
    // INSERE O ARQUIVO NO PLAYER
    audioElement.src = ftpLink;
    alert("Áudio carregado com sucesso a partir do link do FTP!");
  }, 1000);
}



// DAQUI PARA BAIXO SO PARA CODIGAR O ARQUIVO WAV GPT FEZ


// ----------------------------------------------
// Função para criar um arquivo WAV a partir dos dados de áudio
// ----------------------------------------------
function createWAV(audioData) {
  const sampleRate = 44100;
  const bufferLength = audioData.reduce((acc, cur) => acc + cur.length, 0);
  const buffer = new Float32Array(bufferLength);
  let offset = 0;

  for (const chunk of audioData) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  const wavBuffer = encodeWAV(buffer, sampleRate);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

// ----------------------------------------------
// Função para codificar o arquivo WAV
// ----------------------------------------------
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return view;
}
