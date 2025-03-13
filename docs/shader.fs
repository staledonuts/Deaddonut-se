precision highp float;
varying highp vec4 vColor;
uniform vec2 uMousePos;
uniform vec2 uResolution;

vec3 overlay(vec3 base, vec3 overlay)
{ 
    return overlay.rgb * base.rgb * (1.0 - overlay.x);
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
    vec3 baseColor = vColor.rgb; // Black background

    // Glow color
    vec3 glowColor = vec3(0.88, 1.0, 0.47); // Orange glow (you can change this)
    vec3 glowOverlay = glowColor * (glow * glowIntensity);

    // Mix the base color with the glow color based on the glow strength
    vec3 finalColor = overlay(baseColor, glowOverlay);

    // Output the final color
    gl_FragColor = vec4(finalColor, 1.0);
}

