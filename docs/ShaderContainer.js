const numPoints = Math.floor(1000000 / devicePixelRatio ** 3);

async function loadShaderSource(url) 
{
    const response = await fetch(url);
    if (!response.ok) 
    {
        throw new Error(`Failed to load shader: ${url}`);
    }
    return await response.text();
}

async function initShaders(gl) 
{
    const vertexShaderSource = await loadShaderSource('./shader.vs');
    const fragmentShaderSource = await loadShaderSource('./shader.fs');

    const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
    {
        throw new Error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    }

    return shaderProgram;
}

function initWebGL(canvas) 
{
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) 
    {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return null;
    }
    return gl;
}

function createShader(gl, sourceCode, type) 
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initBuffers(canvas, gl) 
{
    let params = [];
    let colors = [];

    for (let i = 0; i < numPoints; i++) 
    {
        // orbit radius
        params.push(radius = Math.random() * Math.random() * 2 - 1);
        // adjust point size with canvas.height
        params.push(size = (Math.random() * Math.min(canvas.height, canvas.width) / 600) / devicePixelRatio);
        // particle phase
        params.push(phase = Math.random() * 2 * 3.1415);

        if (phase > 3.14 + Math.random() && radius > Math.random()*.1 || Math.random() > .9) 
        {
            colors.push(.2 + Math.random()*.5);
            colors.push(.9);
            colors.push(.6 + Math.random()*.4);
        } 
        else 
        {
            colors.push(1);
            colors.push(1);
            colors.push(1);
        }
    }

    const paramsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paramsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(params), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return {params: paramsBuffer, color: colorBuffer, };
}

function drawScene(canvas, gl, programInfo, buffers, time) 
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const uTime = gl.getUniformLocation(programInfo.program, 'uTime');
    gl.uniform1f(uTime, time * 0.001);
    const uAspectRatio = gl.getUniformLocation(programInfo.program, 'uAspectRatio');
    gl.uniform1f(uAspectRatio, canvas.width / canvas.height);
    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.params);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexParams, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexParams);
    }

    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
    }

    gl.useProgram(programInfo.program);
    {
        const offset = 0;
        gl.drawArrays(gl.POINTS, offset, numPoints);
    }
}

// Main function
async function main() 
{
    const canvas = document.getElementById('glcanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = initWebGL(canvas);
    if (!gl) return;

    try 
    {
        const shaderProgram = await initShaders(gl);
        const programInfo = 
        {
            program: shaderProgram,
            attribLocations: 
            {
                vertexParams: gl.getAttribLocation(shaderProgram, 'aVertexParams'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
        };

        const buffers = initBuffers(canvas, gl);


        function render(time) 
        {
            drawScene(canvas, gl, programInfo, buffers, time);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    } 
    catch (e) 
    {
        console.error(e);
    }
}
window.onload = main;