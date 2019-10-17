#version 430

layout(location = 0) in vec4 vertPos;
layout(location = 1) in vec4 texNum;

out vec3 Color;
out float textureNum;

uniform mat4 synth_ViewMatrix;

void main()
{
	gl_Position =synth_ViewMatrix * vertPos;
	textureNum = texNum.x;
}
