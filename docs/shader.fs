

precision highp float;
varying highp vec4 vColor;
uniform vec2 uMousePos;
uniform vec2 uResolution;

vec4 overlay(vec4 base, vec4 overlay, float overlayAlpha)
{
    vec4 overlayBlend = base;
    overlayBlend.rgb = overlay.rgb * overlayAlpha + base.rgb * (1.0 - overlayAlpha);
    overlayBlend.a = clamp(base.a + overlayAlpha, 0.0, 1.0);
 
    return overlayBlend;
}

vec2 SnapUV(vec2 uv)
{
    const float gridSize = 0.001;
    return floor(uv / gridSize) * gridSize;
}

void main(void) 
{
    // Normalize fragment coordinates to [0, 1] range
    vec2 fragCoord = SnapUV(gl_FragCoord.xy / uResolution.xy);

    // Calculate the distance from the fragment to the mouse position
    float dist = distance(fragCoord, (uMousePos + 1.0) * 0.5); // Convert uMouse to [0, 1] range

    // Glow parameters
    float glowRadius = 0.1; // Radius of the glow effect
    float glowIntensity = 2.0; // Intensity of the glow

    // Calculate the glow strength using a smoothstep function
    float glow = smoothstep(glowRadius, 0.0, dist);

    // Base color (background)
    vec4 baseColor = vColor; // Black background

    // Glow color
    vec4 glowOverlay = vec4(1.0, 1.0, 1.0 ,glow) * glowIntensity;

    // Output the final color
    gl_FragColor = overlay(baseColor, glowOverlay, glowOverlay.a);
}

