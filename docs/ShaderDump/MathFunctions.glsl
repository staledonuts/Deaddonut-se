// Function to handle Matrix × Vector multiplication
vec2 mul(mat2 m, vec2 v) 
{
    return m * v;
}

vec3 mul(mat3 m, vec3 v) 
{
    return m * v;
}

vec4 mul(mat4 m, vec4 v) 
{
    return m * v;
}

// Function to handle Vector × Matrix multiplication
vec2 mul(vec2 v, mat2 m) 
{
    return v * m;
}

vec3 mul(vec3 v, mat3 m) 
{
    return v * m;
}

vec4 mul(vec4 v, mat4 m) 
{
    return v * m;
}

// Function to handle Matrix × Matrix multiplication
mat2 mul(mat2 a, mat2 b) 
{
    return a * b;
}

mat3 mul(mat3 a, mat3 b) 
{
    return a * b;
}

mat4 mul(mat4 a, mat4 b) 
{
    return a * b;
}

mat2 mul(mat2 m, float f) 
{
    return m * f;
}



//LERPS

float lerp(float a, float b, float t) 
{
    return a + t * (b - a);
}

vec2 lerp(vec2 a, vec2 b, float t) 
{
    return a + t * (b - a);
}

vec3 lerp(vec3 a, vec3 b, float t) 
{
    return a + t * (b - a);
}

vec4 lerp(vec4 a, vec4 b, float t) 
{
    return a + t * (b - a);
}

float Saturate(float x) 
{
    return clamp(x, 0.0, 1.0);
}
