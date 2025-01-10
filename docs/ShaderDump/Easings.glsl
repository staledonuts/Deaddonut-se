const float PI = 3.1415926f;

float InQuad(float t)
{
    return t * t;
}
float OutQuad(float t)
{
    return 1.0 - InQuad(1.0 - t);
}
float InOutQuad(float t)
{
    if (t < 0.5) 
    {
        return InQuad(t * 2.0) / 2.0;
    }
    return 1.0 - InQuad((1.0 - t) * 2.0) / 2.0;
}
float InCubic(float t) 
{
    return t * t * t;
}
float OutCubic(float t)
{
    return 1.0 - InCubic(1.0 - t);
}
float InOutCubic(float t)
{
    if (t < 0.5) return InCubic(t * 2.0) / 2.0;
    return 1.0 - InCubic((1.0 - t) * 2.0) / 2.0;
}
float InQuart(float t) 
{
    return t * t * t * t;
}
float OutQuart(float t)
{
    return 1.0 - InQuart(1.0 - t);
}
float InOutQuart(float t)
{
    if (t < 0.5) 
    {
        return InQuart(t * 2.0) / 2.0;
    }
    return 1.0 - InQuart((1.0 - t) * 2.0) / 2.0;
}

float InQuint(float t)
{
    return t * t * t * t * t;
}
float OutQuint(float t)
{
    return 1.0 - InQuint(1.0 - t);
}
float InOutQuint(float t)
{
    if (t < 0.5) 
    {
        return InQuint(t * 2.0) / 2.0;
    }
    return 1.0 - InQuint((1.0 - t) * 2.0) / 2.0;
}

float InSine(float t)
{
    return 1.0 - cos(t * PI / 2.0);
}
float OutSine(float t)
{
    return sin(t * PI / 2.0);
}
float InOutSine(float t)
{
    return (cos(t * PI) - 1.0) / -2.0;
}

float InExpo(float t)
{
    return pow(2.0, 10.0 * (t - 1.0));
}
float OutExpo(float t)
{
    return 1.0 - InExpo(1.0 - t);
}

float InOutExpo(float t)
{
    if (t < 0.5) 
    {
        return InExpo(t * 2.0) / 2.0;
    }
    return 1.0 - InExpo((1.0 - t) * 2.0) / 2.0;
}

float InCirc(float t)
{
    return -(sqrt(1.0 - t * t) - 1.0);
}
float OutCirc(float t)
{
    return 1.0 - InCirc(1.0 - t);
}


float InOutCirc(float t)
{
    if (t < 0.5)
    {
        return InCirc(t * 2.0) / 2.0;
    }
    return 1.0 - InCirc((1.0 - t) * 2.0) / 2.0;
}

float OutElastic(float t)
{
    float p = 0.3f;
    return pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * PI) / p) + 1.0;
}

float InElastic(float t)
{
    return 1.0 - OutElastic(1.0 - t);
}

float InOutElastic(float t)
{
    if (t < 0.5) 
    {
        return InElastic(t * 2.0) / 2.0;
    }
    return 1.0 - InElastic((1.0 - t) * 2.0) / 2.0;
}

float InBack(float t)
{
    float s = 1.70158f;
    return t * t * ((s + 1.0) * t - s);
}
float OutBack(float t) 
{
    return 1.0 - InBack(1.0 - t);
}
float InOutBack(float t)
{
    if (t < 0.5) 
    {
        return InBack(t * 2.0) / 2.0;
    }
    return 1.0 - InBack((1.0 - t) * 2.0) / 2.0;
}

float OutBounce(float t)
{
    float div = 2.75f;
    float mult = 7.5625f;

    if (t < 1.0 / div)
    {
        return mult * t * t;
    }
    else if (t < 2.0 / div)
    {
        t -= 1.5f / div;
        return mult * t * t + 0.75f;
    }
    else if (t < 2.5 / div)
    {
        t -= 2.25f / div;
        return mult * t * t + 0.9375f;
    }
    else
    {
        t -= 2.625f / div;
        return mult * t * t + 0.984375f;
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

#define MAX_POINTS 10 // Maximum number of control points

vec2 DeCasteljau(vec2 points[MAX_POINTS], int count, float t)
{
    vec2 tempPoints[MAX_POINTS];
    
    // Copy the input array into a temporary array
    for (int i = 0; i < count; i++) {
        tempPoints[i] = points[i];
    }

    // Iterative De Casteljau Algorithm
    for (int k = 1; k < count; k++) {
        for (int i = 0; i < count - k; i++) {
            tempPoints[i] = mix(tempPoints[i], tempPoints[i + 1], t);
        }
    }

    return tempPoints[0];
}



