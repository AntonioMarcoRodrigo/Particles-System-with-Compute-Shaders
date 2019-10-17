"use strict";
Synthclipse.debugMode = true;

var NUM_PARTICLES = 1024*100;
var WORK_GROUP_SIZE = 128;

var maxLife = 6000;
var atractor_num = 1.0;
var emi_num = 3.0; 

Synthclipse.setGLVersion(4, 3);

Synthclipse.load("gl-matrix-min.js");

var computeProgram = null;
var renderProgram = null;
var postprocessingProgram = null;

var particle_vao = {};

var posSSbo = 0;
var initPosSSbo = 0;
var velSSbo = 0;
var initVelSSbo = 0;
var lifeSSbo = 0;
var maxLifeSSbo = 0;
var atractorSSbo = 0;
var textureSSbo = 0;

var init, end, rendertime;

var pos = new Array(); 
var vel = new Array(); 
var lifeTime = new Array(); 
var maxLifeTime = new Array(); 
var texNum = new Array();

var atractorProperties = new Array();

function random(min, max)
{
	var delta = max - min;
	var random = Math.random() * delta;
	return min + random;
}

//BUCLE DE ATRACTORES
for(var i=0;i<atractor_num;i++)
{
	//coordenada X
	if((i%2)==0) 
		atractorProperties.push(0.0);
	else
		atractorProperties.push(50.0);
	
	//coordenada Y
	if((i%2)==0)
		atractorProperties.push(0);
	else
		atractorProperties.push(-10);
	
	//coordenada Z
	atractorProperties.push(0);
	
	//valor de K
	atractorProperties.push(2);
	
}

//BUCLE DE EMISORES
for(var j=0; j<emi_num;j++)
{

	for (var i=j;i<(NUM_PARTICLES/emi_num)-4;i=i+4)
	{
		if(j==0) //Emisor 1 de agua
		{
			pos.push(random(-25,-25));
			texNum.push(0);
			texNum.push(0);
			texNum.push(0);
			texNum.push(0);
		}
		else if(j==1) //Emisor 2 de fuego
		{
			pos.push(random(23,25));
			texNum.push(1);
			texNum.push(1);
			texNum.push(1);
			texNum.push(1);

		}
			
		else //Emisor 3 de arañas
		{
			pos.push(random(-2,2));
			texNum.push(2);
			texNum.push(2);
			texNum.push(2);
			texNum.push(2)
		}
			
		pos.push(random(1.0,2.0));
		pos.push(0.0);
		pos.push(1);
	}

}

//RELLENAR ARRAYS DE VELOCIDADES, LIFTIMES Y MAXLIFESTIMES
for(var i = 0; i < NUM_PARTICLES-4; i=i+4)
{

	vel.push(random(-0.5,0.5));
	vel.push(1.0);
	vel.push(random(-0.5,0.5));
	vel.push(0.0);

	
	lifeTime.push(0.0);
	lifeTime.push(0.0);
	lifeTime.push(0.0);
	lifeTime.push(0.0);
	
	maxLifeTime.push(i/(maxLife)+1);
	maxLifeTime.push(i/(maxLife)+1);
	maxLifeTime.push(i/(maxLife)+1);
	maxLifeTime.push(i/(maxLife)+1);
	
}



function initShaders() { 
    computeProgram = ProgramFactory.createProgram("Compute Program");
    computeProgram.attachShader("shaders/particleCompute.comp");
    computeProgram.link();
        
    renderProgram = ProgramFactory.createProgram("Display Program");
    
    renderProgram.attachShader("shaders/V.vert");
    renderProgram.attachShader("shaders/G.geom");
    renderProgram.attachShader("shaders/F.frag");
    renderProgram.link();
}


function initBuffers() {	
	particle_vao.id = gl.createVertexArray();
	gl.bindVertexArray(particle_vao.id);
	
	posSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
	
	particle_vao.vertPos = gl.getAttribLocation(renderProgram.getId(), "vertPos");
	gl.vertexAttribPointer(particle_vao.vertPos, 4, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(particle_vao.vertPos);
	
	velSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, velSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vel), gl.DYNAMIC_DRAW);
	
	initVelSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, initVelSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vel), gl.DYNAMIC_DRAW);

	
	lifeSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, lifeSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lifeTime), gl.DYNAMIC_DRAW);

	
	maxLifeSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, maxLifeSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(maxLifeTime), gl.DYNAMIC_DRAW);


	initPosSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, initPosSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);

	
	atractorSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, atractorSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(atractorProperties), gl.DYNAMIC_DRAW);

	textureSSbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureSSbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texNum), gl.DYNAMIC_DRAW);
	particle_vao.texNum = gl.getAttribLocation(renderProgram.getId(), "texNum");
	gl.vertexAttribPointer(particle_vao.texNum, 4, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(particle_vao.texNum);
	
	
	
	gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, 0);
}



function drawScene() {
	computeProgram.use();
	computeProgram.applyUniforms();
	
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 4, posSSbo);
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 5, velSSbo);
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 6, lifeSSbo);
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 7, maxLifeSSbo);
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 8, initPosSSbo);
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 9, initVelSSbo);
	gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 10, atractorSSbo);
	
	gl.dispatchCompute(NUM_PARTICLES/WORK_GROUP_SIZE, 1, 1);
	gl.memoryBarrier( gl.SHADER_STORAGE_BARRIER_BIT );
	

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	renderProgram.use();
	renderProgram.applyUniforms();

	
	gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
}


var viewportWidth = 0;
var viewportHeight = 0;

var renderable = {};

renderable.init = function() {
	gl.clearColor(1.0,1.0,1.0,1.0);
	initShaders();
	initBuffers();
	
	CameraManager.useSphericalCamera();
	
	Synthclipse.createScriptControls();
};

renderable.display = function() {
	init = Synthclipse.getSystemTime();
	drawScene();
	end = Synthclipse.getSystemTime();
	rendtime = end - init;
	out.println("Tiempo: " + rendtime);
};

renderable.resize = function(width, height) {
	viewportWidth = width;
	viewportHeight = height;
};

Synthclipse.setRenderable(renderable);