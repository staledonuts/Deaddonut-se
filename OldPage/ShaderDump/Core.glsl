#include "MathFunctions.glsl"

vec2 RotateDegrees(vec2 UV, vec2 Center, float Rotation)
{
    Rotation = Rotation * (3.1415926f/180.0f);
    UV -= Center;
    float s = sin(Rotation);
    float c = cos(Rotation);
    mat2 rMatrix = mat2(c, -s, s, c);
    rMatrix *= 0.5;
    rMatrix += 0.5;
    rMatrix = mul(rMatrix, 2.0) - 1.0;
    UV.xy = mul(UV.xy, rMatrix);
    UV += Center;
    return UV;
}

vec4 OverlayTexture(vec4 base, vec4 overlay, float alphaOpacity)
{
    vec4 overlayBlend = base;
    float overlayAlpha = lerp(0.0, overlay.a, alphaOpacity);
    overlayBlend.rgb = overlay.rgb * overlayAlpha + base.rgb * (1.0 - overlayAlpha);
    overlayBlend.a = Saturate(base.a + overlayAlpha);
    return overlayBlend;
}

vec2 TilingAndOffset(vec2 UV, vec4 Tiling, vec2 Offset)
{
    vec2 returnUV = UV * Tiling.xy + Tiling.zw;
    return returnUV + Offset;
}

vec2 SnapUV(vec2 uv)
{
    const float gridSize = 0.001;
    return floor(uv / gridSize) * gridSize;
}

vec4 AcesTonemap(vec4 color) 
{  
    mat3 m1 = mat3
    (
        0.59719, 0.07600, 0.02840,
        0.35458, 0.90834, 0.13383,
        0.04823, 0.01566, 0.83777
    );
    mat3 m2 = mat3
    (
        1.60475, -0.10208, -0.00327,
        -0.53108,  1.10813, -0.07276,
        -0.07367, -0.00605,  1.07602
    );

    vec3 aceify = vec3(color.x, color.y, color.z);
    vec3 v = m1 * aceify;  
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return vec4 (pow(clamp(m2 * (a / b), 0.0, 1.0), vec3(1.0 / 2.2)), color.w);
}

vec3 blendOverlay(vec3 base, vec3 blend) 
{
    return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
    // with conditionals, may be worth benchmarking
    // return vec3(
    //     base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
    //     base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
    //     base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
    // );
}