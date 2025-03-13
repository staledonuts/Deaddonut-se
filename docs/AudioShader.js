/**
 * @module  audio-shader
 */

var Through = require('audio-through');
var inherits = require('inherits');
var createShader = require('nogl-shader-output');
var createContext = require('nogl');
var Shader = require('gl-shader');


/**
 * @constructor
 *
 * @param {Function} fn Shader code
 * @param {Object} options Options
 */
function AudioShader (shaderCode, options) {
	if (!(this instanceof AudioShader)) return new AudioShader(shaderCode, options);

	options = options || {};

	Through.call(this, options);

	//refine number of channels - vec4 is max output
	var channels = this.format.channels = Math.min(this.format.channels, 4);

	//refine shader code, if not passed
	if (!shaderCode) 
	{
		var vecType = channels === 1 ? 'float' : ('vec' + channels);
		shaderCode = `${vecType} mainSound( float time )
		{
			return ${vecType}( sin(6.2831*440.0*time)*exp(-3.0*time) );
		}`;
	}

	var gl = options.gl || createContext();

	var shader = Shader(gl, `
		precision mediump float;
		precision mediump int;

		attribute vec2 position;

		uniform float iGlobalTime;
		uniform float iSampleRate;
		uniform vec3  iResolution;

		varying float time;

		void main (void) {
			gl_Position = vec4(position, 0, 1);
			time = iGlobalTime + (position.x * 0.5 + 0.5) * iResolution.x / iSampleRate;
		}
	`, `
		precision mediump float;
		precision mediump int;

		uniform vec3      iResolution;           // viewport resolution (in pixels)
		uniform float     iGlobalTime;           // shader playback time (in seconds)
		uniform int       iFrame;                // shader playback frame
		uniform vec4      iDate;                 // (year, month, day, time in seconds)
		uniform float     iSampleRate;           // sound sample rate (i.e., 44100)
		uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
		// uniform sampler2D iChannel0;             // input channel1
		// uniform sampler2D iChannel1;             // input channel2
		// uniform sampler2D iChannel2;             // input channel3
		// uniform sampler2D iChannel3;             // input channel4

		varying float time;

		${shaderCode}

		void main (void) {
			vec4 result = vec4(mainSound(time)${
				channels === 1 ? ', 0, 0, 0' :
				channels === 3 ? ', 0' :
				channels === 4 ? '' : ', 0, 0'
			});
			gl_FragColor = result;
		}`);

	//setup shader
	this.draw = createShader(shader, {
		width: this.format.samplesPerFrame,
		height: 1
	});

	//clean on end
	this.on('end', function () {
		throw Error('Unimplemented');
	});
}

inherits(AudioShader, Through);



/**
 * Send chunk to audio-shader, invoke done on return.
 * The strategy: render each audio channel to it’s own line in result
 * TODO: thing to replace with textures
 * TODO: provide input channels as textures
 * TODO: provide values of previous input/output to implement filters
 */
AudioShader.prototype.process = function (chunk, done) {
	var w = this.format.samplesPerFrame;
	var channels = Math.min(chunk.numberOfChannels, this.format.channels);

	//set up current chunk as a channels data
	// for (var channel = 0; channel < channels; channel++) {
	// 	var texture = new Texture(gl, chunk.getChannelData(channel));
	// 	this.shader.uniforms[`iChannel${channel}`] = texture.bind();
	// 	this.shader.uniforms.iChannelResolution[channel] = [chunk.length, 1, 1];
	// 	this.shader.uniforms.iChannelTime[channel] = [];
	// }

	//preset new time value
	var d = new Date();

	//render chunk
	var result = this.draw({
		iResolution: [w, 1, 1],
		iSampleRate: this.format.sampleRate,
		iGlobalTime: this.time,
		iFrame: this.frame,
		iDate: [
			d.getFullYear(), // the year (four digits)
			d.getMonth(), // the month (from 0-11)
			d.getDate(), // the day of the month (from 1-31)
			d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds()
		]
	});

	//transform result to buffer channels (color channel per audio channel)
	for (var channel = 0; channel < channels; channel++) {
		var cData = chunk.getChannelData(channel);
		for (var i = 0; i < w; i++) {
			cData[i] = result[i * 4 + channel];
		}
	}

	done();
}

async function setupAudioTexture(gl)
{
    const audio = document.getElementById('audio');
    audio.crossOrigin = "anonymous"; // Allow audio cross-origin if hosted externally.
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const texture = gl.createTexture();

    function updateTexture() 
    {
        analyser.getByteFrequencyData(dataArray);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dataArray.length, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, dataArray);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);

        requestAnimationFrame(updateTexture);
    }
    updateTexture();

    return texture;
}

async function MainAudioShader()
{
	const audioTexture = await setupAudioTexture(gl);
	// Pass `audioTexture` as a uniform in your shader program:
	const uAudio = gl.getUniformLocation(programInfo.program, 'uAudioTexture');
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, audioTexture);
	gl.uniform1i(uAudio, 0);
}


module.exports = AudioShader;
