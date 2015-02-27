var gl;

var cubeVerticesBuffer;
var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var perspectiveMatrix;

// Starting rotation angle
var squareRotation = 0.0;
var lastSquareUpdateTime = 0;
// Starting translate offsets
var squareXOffset = 0.0;
var squareYOffset = 0.0;
var squareZOffset = 0.0;
// our translation increments
var xIncValue = 0.2;
var yIncValue = -0.4;
var zIncValue = 0.3;

var start = function() {
	var horizAspect = 480.0/640.0;
	var canvas = document.getElementById('glCanvas');

	gl = initWebGL(canvas);
	// Only proceed if gl was successfully initalized.
	if(gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		initShaders();
		initBuffers();

		setInterval(drawScene, 15); //redraw 33ms (or about 30fps) 
		drawScene();
	}
}

var initBuffers = function() {
	cubeVerticesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
// Create the object we're looking at
	// vertices are the object we are rendering first here.
	var vertices = [
		// Front Face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		// Back Face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,
		// Top Face 
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		// Bottom Face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,
		// Right Face
		 1.0, -1.0, -1.0, 
		 1.0,  1.0, -1.0, 
		 1.0,  1.0,  1.0, 
		 1.0, -1.0,  1.0,
		// Left Face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,  
		-1.0,  1.0,  1.0, 
		-1.0,  1.0, -1.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	cubeVerticesIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	// this array defines each face as two triangles
	// each triplet corresponds to three rows of coordinates above
	var cubeVertexIndices = [
		0,  1,  2,   0,  2,  3,   //front
		4,  5,  6,   4,  6,  7,   //back
		8,  9, 10,   8, 10, 11,   //top
		12,13, 14,  12, 14, 15,   //bottom
		16,17, 18,  16, 18, 19,   //right
		20,21, 22,  20, 22, 23    //left
	]

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

// Specify the colors associated with the vertices
	cubeVerticesColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
	// colors will be the color of each of our vertices
	// each row follows pattern, "r, g, b, a" where a = alpha (transparency)
	var colors = [
		[1.0, 1.0, 1.0, 1.0], 	//front - white
		[1.0, 0.0, 0.0, 1.0], 	//back - red
		[0.0, 1.0, 0.0, 1.0], 	//top - green
		[0.0, 0.0, 1.0, 1.0],  	//bottom - blue
		[1.0, 1.0, 0.0, 1.0],   //right - yellow
		[1.0, 0.0, 1.0, 1.0]	//left - purple
	]
	var generatedColors = [];
	for (j=0; j<6; j++) {
		var c = colors[j];
		for (var i=0; i<4; i++) {
			generatedColors = generatedColors.concat(c);
		}
	}

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(generatedColors), gl.STATIC_DRAW);
}

var initTextures = function() {
	cubeTexture = gl.createTexture();
	cubeImage = new Image();
	cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
	cubeImage.src = "tex/onePip.png";
}

var handleTextureLoaded = function(image, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipMap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

var drawScene = function() {
	// Clear the canvas every redraw
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
	// this will be the viewpoint - we start looking at the scene from (x,y)=(0,0) and zoomed out 6 px
	loadIdentity();
	mvTranslate([-0.0, 0.0, -6.0]);

	// Save the current matrix to rotate before we draw
	mvPushMatrix();
	mvRotate(squareRotation, [1,0,1]);
	mvTranslate([squareXOffset, squareYOffset, squareZOffset]);
	
	// Bind the position buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	
	// Bind the color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesColorBuffer);
	gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

	// Restore original matrix
	mvPopMatrix();
	
	// After drawing, adjust matrix based on rotation variable
	// Updates square rotation and translation for the next draw cycle
	var currentTime = (new Date).getTime();
	if(lastSquareUpdateTime) {
		var delta = currentTime - lastSquareUpdateTime;
		
		// Add rotation
		squareRotation += (30*delta) / 1000.0;
		// Add translation
		squareXOffset += xIncValue * ((30*delta)/1000.0);
		squareYOffset += yIncValue * ((30*delta)/1000.0);
		squareZOffset += zIncValue * ((30*delta)/1000.0);
		
		if(Math.abs(squareYOffset) > 2.5){
			xIncValue = -xIncValue;
			yIncValue = -yIncValue;
			zIncValue = -zIncValue;
		}
	}
	lastSquareUpdateTime = currentTime;
}
