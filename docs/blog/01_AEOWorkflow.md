

# AEOD, A texture workflow i use in my own projects.

## What i like about this workflow.

## Channelpacking AEOD.

| R | G | B | A |
|----------|----------|----------|----------|
| Alpha | Emissive | AO | Depth |

![Alt text](images/blog/T_FX_Glow_AEO.png)



## Shader Shenanigans.
#### glsl include code for godot.

```
struct AEODChannels
{
	float alpha;     // R – opacity / clip mask
	float emissive;  // G – emissive intensity [0,1]
	float ao;        // B – ambient occlusion  [0,1]
	float depth;     // A – height / depth     [0,1]
};

struct AEODResult
{
	vec3  albedo;    // assign to ALBEDO
	vec3  emission;  // assign to EMISSION
	float alpha;     // assign to ALPHA
};

// Unpack the four channels from the packed texture.
AEODChannels aeod_sample(sampler2D tex, vec2 uv)
{
	vec4 s = texture(tex, uv);
	AEODChannels ch;
	ch.alpha    = s.r;
	ch.emissive = s.g;
	ch.ao       = s.b;
	ch.depth    = s.a;
	return ch;
}

```