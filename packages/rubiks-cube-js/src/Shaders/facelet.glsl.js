export const vertex = `#version 300 es

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aUV;

out vec2 uv;
out vec2 pos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    uv = aUV;
    pos = aPos.yz;
}`

export const fragment = `#version 300 es

precision mediump float;

in vec2 uv;
in vec2 pos;

out vec4 FragColor;

uniform sampler2D tex;
uniform vec3 colorMult;

vec3 rime = vec3(0.07);
float outer = 0.45;
float inner = 0.44;

float map(float value, float min1, float max1, float min2, float max2)
{
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main()
{
    float x = abs(pos.x);
    float y = abs(pos.y);
    if (x > outer || y > outer) {
        FragColor = vec4(rime, 1.0);
        return;
    }
    vec3 color = texture(tex, uv).rgb * colorMult;
    if (x > inner || y > inner) {
        float t = smoothstep(0.0, 1.0, map(max(x, y), outer, inner, 0.0, 1.0));
        vec3 c = color * t + rime * (1.0 - t);
        FragColor = vec4(c, 1.0);
        return;
    }
    FragColor = vec4(color, 1.0);
}`