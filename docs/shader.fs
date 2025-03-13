precision highp float;
varying highp vec4 vColor;
uniform vec2 uMousePos;
uniform vec2 uResolution;
void main(void) 
{
    // Normalize fragment coordinates to [0, 1] range
    vec2 fragCoord = gl_FragCoord.xy / uResolution;

    // Calculate the distance from the fragment to the mouse position
    float dist = distance(fragCoord, (uMousePos + 1.0) * 0.5); // Convert uMouse to [0, 1] range

    // Glow parameters
    float glowRadius = 0.1; // Radius of the glow effect
    float glowIntensity = 0.5; // Intensity of the glow

    // Calculate the glow strength using a smoothstep function
    float glow = smoothstep(glowRadius, 0.0, dist);

    // Base color (background)
    vec3 baseColor = vColor.rgb; // Black background

    // Glow color
    vec3 glowColor = vec3(1.0, 0.5, 0.2); // Orange glow (you can change this)

    // Mix the base color with the glow color based on the glow strength
    vec3 finalColor = mix(baseColor, glowColor, glow * glowIntensity);

    // Output the final color
    gl_FragColor = vec4(finalColor, 1.0);
}