#version 430
#extension GL_EXT_geometry_shader4: enable

layout(points) in;
layout(triangle_strip, max_vertices=4) out;

out vec2 uv;

uniform mat4 synth_ProjectionMatrix;

in float textureNum[];
out float texNum;


void main()
{
	float SpriteStartSize = 1.4;
	float SpriteEndSize = 3.5;

	vec3 p = gl_PositionIn[0].xyz;
	texNum = textureNum[0];

	vec3 up = vec3(0.0, 1.0, 0.0);
	vec3 right = vec3(1.0, 0.0, 0.0);

	float SpriteSize = mix(SpriteStartSize, SpriteEndSize, 0.5);

	vec3 p0 = p - up*SpriteSize - right*SpriteSize;
	vec2 uv0 = vec2(0, 0);
	vec3 p1 = p - up*SpriteSize + right*SpriteSize;
	vec2 uv1 = vec2(1, 0);
	vec3 p2 = p + up*SpriteSize - right*SpriteSize;
	vec2 uv2 = vec2(0, 1);
	vec3 p3 = p + up*SpriteSize + right*SpriteSize;
	vec2 uv3 = vec2(1, 1);

	gl_Position = synth_ProjectionMatrix * vec4(p0, 1.0);
	uv = uv0;
	EmitVertex();

	gl_Position = synth_ProjectionMatrix * vec4(p1, 1.0);
	uv = uv1;
	EmitVertex();

	gl_Position = synth_ProjectionMatrix * vec4(p2, 1.0);
	uv = uv2;
	EmitVertex();

	gl_Position = synth_ProjectionMatrix * vec4(p3, 1.0);
	uv = uv3;
	EmitVertex();

	EndPrimitive();
}
