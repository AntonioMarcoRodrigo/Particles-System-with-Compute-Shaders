#version 430

in vec2 uv;
in float texNum;

out vec4 glFragColor;

uniform sampler2D Texture; //! texture["texturas/droplets.png"]

uniform sampler2D Texture2; //! texture["texturas/Fires.png"]

uniform sampler2D Texture3; //! texture["texturas/spiders.png"]


void main()
{
	float ParticleLifeTime = 4.0;
	float TextureAtlastColumns = 6;
	float TextureAtlastRows = 5;


	float lifeTimeStep = ParticleLifeTime / (TextureAtlastColumns * TextureAtlastRows);


	float uStep = 1.0 / TextureAtlastColumns;
	float vStep = 1.0 / TextureAtlastRows;


	float finalU =  uStep * uv.x;
	float finalV =  vStep * uv.y;
	vec4 color = vec4(0.0,0.0,0.0,0.0);
	if(texNum==0)
		color = texture(Texture, vec2(finalU, finalV));
	else if(texNum==1)
		color = texture(Texture2, vec2(finalU, finalV));
	else
		color = texture(Texture3, vec2(finalU, finalV));
	if(color.a < 0.5)
		discard;


	glFragColor = color;
}
