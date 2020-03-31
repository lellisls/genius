export default function createAudio() {
  const frequencies = [130.812775, 146.832367, 164.813782, 174.614105];
  let audioContext = null;

  function audioSetup() {
    audioContext = new AudioContext();
  }

  function beep(vol, freq, duration) {
    if (!audioContext) {
      return;
    }
    let v = audioContext.createOscillator();
    let u = audioContext.createGain();
    v.connect(u);
    v.frequency.value = freq;
    v.type = "square";
    u.connect(audioContext.destination);
    u.gain.value = vol * 0.01;
    v.start(audioContext.currentTime);
    v.stop(audioContext.currentTime + duration * 0.001);
  }

  function audioBeep({ zone }) {
    beep(20, frequencies[zone], 100);
  }

  function eventHandler(command) {
    const acceptedCommands = {
      audioSetup,
      audioBeep
    };

    const commandFunction = acceptedCommands[command.type];

    if (commandFunction) {
      console.log(`Audio received: ${command.type}`);
      commandFunction(command.data);
    }
  }
  return {
    eventHandler
  };
}
