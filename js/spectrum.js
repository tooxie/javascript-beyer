Beyer.Spectrum = {
    draw: function(e) {
        var fb = e.frameBuffer,
            t  = e.time,
            signal = new Float32Array(fb.length / this.channels),
            spectrumLength = this.fft.spectrum.length,
            barWidth = 2,  // Hardcoded values for optimization
            maxHeight = 200,
            magnitude;

        for (var i = 0, fbl = this.frameBufferLength / 2; i < fbl; i++) {
            // Assuming interlaced stereo channels,
            // need to split and merge into a stero-mix mono signal
            signal[i] = (fb[2*i] + fb[2*i+1]) / 2;
        }

        this.fft.forward(signal);

        // Clear the canvas before drawing spectrum
        this.ctx.clearRect(0,0, this.canvas.offsetWidth, this.canvas.offsetHeight);

        for (var i = 0; (i/2) * 6 < this.canvas.offsetWidth; i = i + 2) {
            // multiply spectrum by a zoom value
            magnitude = this.fft.spectrum[i] * 4000;

            // Draw rectangle bars for each frequency bin
            this.ctx.fillRect((i/2) * 6, this.canvas.offsetHeight, 4, -(magnitude > maxHeight ? maxHeight : magnitude));
        }
    },
    init: function(audio) {
        this.canvas = document.getElementById('spectrumcanvas');
        this.ctx = this.canvas.getContext('2d');
        this.channels = audio.mozChannels;
        this.rate = audio.mozSampleRate;
        this.frameBufferLength = audio.mozFrameBufferLength;
        this.fft = new this.FFT(this.frameBufferLength / this.channels, this.rate);
    }
};

/*
var canvas = document.getElementById('spectrum'),
    ctx = canvas.getContext('2d'),
    channels,
    rate,
    frameBufferLength,
    fft;

function loadedMetadata() {
  channels          = audio.mozChannels;
  rate              = audio.mozSampleRate;
  frameBufferLength = audio.mozFrameBufferLength;

  fft = new FFT(frameBufferLength / channels, rate);
}

function audioAvailable(event) {
}

var audio = document.getElementById('audio-element');
audio.addEventListener('MozAudioAvailable', audioAvailable, false);
*/
