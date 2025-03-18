precision highp float;

varying vec2 vUv; // UV coordinates from the vertex shader
varying vec3 vNormal; // Normals from the vertex shader
varying vec3 vPosition; // Vertex position from the vertex shader

uniform float time; // Example uniform (can be updated from JavaScript)


vec4 overlay(vec4 base, vec4 overlay, float overlayAlpha)
{
    vec4 overlayBlend = base;
    overlayBlend.rgb = overlay.rgb * overlayAlpha + base.rgb * (1.0 - overlayAlpha);
    overlayBlend.a = clamp(base.a + overlayAlpha, 0.0, 1.0);
 
    return overlayBlend;
}

vec2 SnapUV(vec2 uv)
{
    const float gridSize = 0.01;
    return floor(uv / gridSize) * gridSize;
}

float OutBounce(float t)
{
    float div = 2.75;
    float mult = 7.5625;

    if (t < 1.0 / div)
    {
        return mult * t * t;
    }
    else if (t < 2.0 / div)
    {
        t -= 1.5 / div;
        return mult * t * t + 0.75;
    }
    else if (t < 2.5 / div)
    {
        t -= 2.25 / div;
        return mult * t * t + 0.9375;
    }
    else
    {
        t -= 2.625 / div;
        return mult * t * t + 0.984375;
    }
}

float InBounce(float t)
{
    return 1.0 - OutBounce(1.0 - t);
}

float InOutBounce(float t)
{
    if (t < 0.5) 
    {
        return InBounce(t * 2.0) / 2.0;
    }
    return 1.0 - InBounce((1.0 - t) * 2.0) / 2.0;
}

void main() 
{
  // Example: Create a color based on UV coordinates and time
  vec3 color = vec3(vUv.x, vUv.y, abs(sin(time)));

  // Output the final color
  gl_FragColor = vec4(color, 1.0); // RGBA color
}
