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

void main(void) 
{
    // Normalize fragment coordinates to [0, 1] range
    vec2 fragCoord = gl_FragCoord.xy / uResolution;

    // Calculate the distance from the fragment to the mouse position
    float dist = distance(fragCoord, (uMousePos + 1.0) * 0.5); // Convert uMouse to [0, 1] range

    // Glow parameters
    float glowRadius = 0.1; // Radius of the glow effect
    float glowIntensity = 1.0; // Intensity of the glow

    // Calculate the glow strength using a smoothstep function
    float glow = smoothstep(glowRadius, 0.0, dist);

    // Base color (background)
    vec4 baseColor = vColor; // Black background

    // Glow color
    vec4 glowOverlay = vec4(0.88, 1.0, 0.47,glow * glowIntensity);

    // Mix the base color with the glow color based on the glow strength

    // Output the final color
    gl_FragColor = overlay(baseColor, glowOverlay, glowOverlay.a);
}

