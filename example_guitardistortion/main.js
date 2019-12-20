import SuperpoweredModule from '../superpowered.js'

var audioContext = null; // Reference to the audio context.
var audioNode = null;    // This example uses one audio node only.
var Superpowered = null; // Reference to the Superpowered module.
var content = null;      // The <div> displaying everything.

const presets = {
    transparent: {
        distortion0: false,
        distortion1: false,
        marshall: false,
        ada: false,
        vtwin: false,
        drive: 0,
        gainDecibel: 0,
        bassFrequency: 1,
        trebleFrequency: 22050,
        eq80HzDecibel: 0,
        eq240HzDecibel: 0,
        eq750HzDecibel: 0,
        eq2200HzDecibel: 0,
        eq6600HzDecibel: 0
    },
    preset1: {
        distortion0: false,
        distortion1: true,
        marshall: false,
        ada: false,
        vtwin: false,
        drive: 80,
        gainDecibel: -10,
        bassFrequency: 1,
        trebleFrequency: 22050,
        eq80HzDecibel: 0,
        eq240HzDecibel: -6,
        eq750HzDecibel: -12,
        eq2200HzDecibel: -6,
        eq6600HzDecibel: 0
    },
    preset2: {
        distortion0: true,
        distortion1: false,
        marshall: true,
        ada: false,
        vtwin: false,
        drive: 10,
        gainDecibel: -12,
        bassFrequency: 25,
        trebleFrequency: 22050,
        eq80HzDecibel: 0,
        eq240HzDecibel: -6,
        eq750HzDecibel: -3,
        eq2200HzDecibel: -6,
        eq6600HzDecibel: 3
    }
}

// click on play/pause
function togglePlayback(e) {
    let button = document.getElementById('playPause');
    if (button.value == 1) {
        button.value = 0;
        button.innerText = 'START PLAYBACK';
        audioContext.suspend();
    } else {
        button.value = 1;
        button.innerText = 'PAUSE';
        audioContext.resume();
    }
}

// applies a preset on all controls
function applyPreset(preset) {
    let sliders = document.getElementsByClassName('slider');
    for (let slider of sliders) {
        slider.value = preset[slider.id];
        slider.oninput();
    }
    let checkboxes = document.getElementsByClassName('checkbox');
    for (let checkbox of checkboxes) {
        checkbox.checked = preset[checkbox.id];
        checkbox.oninput();
    }
}

// we have the audio system created, let's display the UI and start playback
function onAudioDecoded(buffer) {
    // send the PCM audio to the audio node
    audioNode.sendMessageToAudioScope({
         left: buffer.getChannelData(0),
         right: buffer.getChannelData(1) }
    );

    // audioNode -> audioContext.destination (audio output)
    audioContext.suspend();
    audioNode.connect(audioContext.destination);

    // UI: innerHTML may be ugly but keeps this example relatively small
    content.innerHTML = '\
        <h3>Choose from these presets for A/B comparison:</h3>\
        <p id="presets"></p>\
        <h3>Play/pause:</h3>\
        <button id="playPause" value="0">START PLAYBACK</button>\
        <h3>Fine tune all controls:</h3>\
        <p>Distortion Sound 1 <input type="checkbox" class="checkbox" id="distortion0"></p>\
        <p>Distortion Sound 2 <input type="checkbox" class="checkbox" id="distortion1"></p>\
        <p>Marshall Cabinet Simulation <input type="checkbox" class="checkbox" id="marshall"></p>\
        <p>ADA Cabinet Simulation <input type="checkbox" class="checkbox" id="ada"></p>\
        <p>V-Twin Preamp Simulation <input type="checkbox" class="checkbox" id="vtwin"></p>\
        <p>Drive (<span id="driveValue"></span>%): <input type="range" min="0" max="100" data-multiplier="0.01" class="slider" id="drive"></p>\
        <p>Gain (<span id="gainDecibelValue"></span>db): <input type="range" min="-96" max="24" class="slider" id="gainDecibel"></p>\
        <p>Bass (<span id="bassFrequencyValue"></span>Hz): <input type="range" min="1" max="250" class="slider" id="bassFrequency"></p>\
        <p>Treble (<span id="trebleFrequencyValue"></span>Hz): <input type="range" min="6000" max="22050" class="slider" id="trebleFrequency"></p>\
        <p>EQ 80 Hz (<span id="eq80HzDecibelValue"></span>db): <input type="range" min="-96" max="24" class="slider" id="eq80HzDecibel"></p>\
        <p>EQ 240 Hz (<span id="eq240HzDecibelValue"></span>db): <input type="range" min="-96" max="24" class="slider" id="eq240HzDecibel"></p>\
        <p>EQ 750 Hz (<span id="eq750HzDecibelValue"></span>db): <input type="range" min="-96" max="24" class="slider" id="eq750HzDecibel"></p>\
        <p>EQ 2200 Hz (<span id="eq2200HzDecibelValue"></span>db): <input type="range" min="-96" max="24" class="slider" id="eq2200HzDecibel"></p>\
        <p>EQ 6600 Hz (<span id="eq6600HzDecibelValue"></span>db): <input type="range" min="-96" max="24" class="slider" id="eq6600HzDecibel"></p>\
    ';

    // make the preset buttons
    let p = document.getElementById('presets');
    for (let preset in presets) {
        let button = document.createElement('button');
        button.id = preset;
        button.innerText = preset;
        button.addEventListener('click', function() {
            applyPreset(presets[this.id]);
            if (document.getElementById('playPause').value != 1) togglePlayback();
        });
        p.appendChild(button);
        p.appendChild(document.createTextNode(' '));
    }

    document.getElementById('playPause').addEventListener('click', togglePlayback);

    // slider actions
    let sliders = document.getElementsByClassName('slider');
    for (let slider of sliders) {
        slider.oninput = function() {
            if (audioNode == null) return;
            document.getElementById(this.id + 'Value').innerText = this.value;
            let message = {};
            let multiplier = slider.hasAttribute('data-multiplier') ? parseFloat(slider.getAttribute('data-multiplier')) : 1;
            message[this.id] = this.value * multiplier;
            audioNode.sendMessageToAudioScope(message);
        }
    }

    // checkbox actions
    let checkboxes = document.getElementsByClassName('checkbox');
    for (let checkbox of checkboxes) {
        checkbox.oninput = function() {
            if (audioNode == null) return;
            let message = {};
            message[this.id] = this.checked;
            audioNode.sendMessageToAudioScope(message);
        }
    }

    applyPreset(presets.transparent);
}

// when the START button is clicked
function start() {
    content.innerText = 'Creating the audio context and node...';
    audioContext = Superpowered.getAudioContext(44100);
    let currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));

    Superpowered.createAudioNode(audioContext, currentPath + '/processor.js', 'MyProcessor',
        // runs after the audio node is created
        function(newNode) {
            audioNode = newNode;
            content.innerText = 'Downloading music...';

            // downloading the music
            let request = new XMLHttpRequest();
            request.open('GET', 'track.wav', true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                content.innerText = 'Decoding audio...';
                audioContext.decodeAudioData(request.response, onAudioDecoded);
            }
            request.send();
        },

        // runs when the audio node sends a message
        function(message) {
            console.log('Message received from the audio node: ' + message);
        }
    );
}

Superpowered = SuperpoweredModule({
    licenseKey: 'ExampleLicenseKey-WillExpire-OnNextUpdate',
    enableAudioEffects: true,

    onReady: function() {
        content = document.getElementById('content');
        content.innerHTML = '<button id="startButton">START</button>';
        document.getElementById('startButton').addEventListener('click', start);
    }
});
