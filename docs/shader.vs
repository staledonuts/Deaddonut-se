precision highp float;
attribute vec3 aVertexParams;
attribute vec3 aVertexColor;
uniform float uTime;
uniform float uAspectRatio;
varying highp vec4 vColor;

void main(void) 
{
    // move in ellipse
    float x = sin(uTime*.2 + aVertexParams.z) * aVertexParams.x*(0.6 + .2*sin(uTime*.1));
    float y = cos(uTime*.2 + aVertexParams.z) * aVertexParams.x*(1.0 + .3*cos(uTime*.4));

    // rotate each orbit depending on its radius
    float a = log(aVertexParams.x)*(3.2+.7*sin(uTime*.3)) - uTime*0.1;

    // define position for each point
    gl_Position = vec4(x * cos(a) - y * sin(a), x * sin(a) + y * cos(a), 0, 1.0);

    // slightly squeeze by Y to see galaxy in 'perspective'
    gl_Position.y *= uAspectRatio;

    // don't set the size too large because you get rectngles
    gl_PointSize = aVertexParams.y + 0.5;

    // pass the color to fragment shader
    vColor = vec4(aVertexColor*(1.2-aVertexParams.x), 1);
}

