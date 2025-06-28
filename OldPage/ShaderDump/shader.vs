precision highp float;
attribute vec2 uv;
attribute vec3 position; // Declare position attribute
attribute vec3 normal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv; // Pass UV coordinates to the fragment shader
varying vec3 vNormal; // Pass normals to the fragment shader
varying vec3 vPosition; // Pass vertex position to the fragment shader

void main() 
{
    // Pass data to the fragment shader
    vUv = uv; // UV coordinates
    vNormal = normal; // Normals
    vPosition = position; // Vertex position

    // Transform the vertex position to clip space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

