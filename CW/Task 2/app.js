//
// Earth and Satellite application
//

var canvas = document.getElementById('webglCanvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

var gl = canvas.getContext('webgl');
if (!gl) {
	alert('WebGL not supported');
	throw new Error('WebGL not supported');
}

//Global variables

var vsSource = `
			         attribute vec4 aVertexPosition;
                     attribute vec4 aVertexColor;
			         attribute vec2 aTextureCoord;
			         uniform mat4 uModelViewMatrix;
			         uniform mat4 uProjectionMatrix;
			         varying highp vec2 vTextureCoord;
                     varying lowp vec4 vColor; 
			         void main(void) {
			             gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			             vTextureCoord = aTextureCoord;
                         vColor = aVertexColor;
			         }
			     `;

var fsSource = `
			         varying highp vec2 vTextureCoord;
                     varying lowp vec4 vColor;
			         uniform sampler2D uSampler;
                     uniform bool uUseTexture;
			         void main(void) {
                        if (uUseTexture) {
                            gl_FragColor = texture2D(uSampler, vTextureCoord);
                        } else {
                            gl_FragColor = vColor;
                        }
                    }
			     `;

// gl_FragColor = vColor; >

function initShaderProgram(gl, vsSource, fsSource) {
	var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	return shaderProgram;
}

function loadShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

var shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Function to create the sphere
function createSphereData(radius, latitudeBands, longitudeBands) {
	var vertices = [];
	var textureCoords = [];
	var indices = [];

	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = (latNumber * Math.PI) / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);

		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = (longNumber * 2 * Math.PI) / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			var u = 1 - longNumber / longitudeBands;
			var v = latNumber / latitudeBands; // Flipping the texture's Y-coordinate

			vertices.push(radius * x);
			vertices.push(radius * y);
			vertices.push(radius * z);
			textureCoords.push(u);
			textureCoords.push(v);
		}
	}
	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = latNumber * (longitudeBands + 1) + longNumber;
			var second = first + longitudeBands + 1;

			indices.push(first);
			indices.push(second);
			indices.push(first + 1);

			indices.push(second);
			indices.push(second + 1);
			indices.push(first + 1);
		}
	}

	return {
		vertices: vertices,
		textureCoords: textureCoords,
		indices: indices
	};
}

var sphereData = createSphereData(30, 40, 40);

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.vertices), gl.STATIC_DRAW);

var textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.textureCoords), gl.STATIC_DRAW);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereData.indices), gl.STATIC_DRAW);

function loadTexture(gl, url) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	var level = 0;
	var internalFormat = gl.RGBA;
	var width = 1;
	var height = 1;
	var border = 0;
	var srcFormat = gl.RGBA;
	var srcType = gl.UNSIGNED_BYTE;
	var pixel = new Uint8Array([0, 0, 255, 255]);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
	var image = new Image();
	image.onload = function () {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
		if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;
	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}
var earthTexture = loadTexture(gl, 'earth.jpg');

function drawEarth(gl, vertexBuffer, textureCoordBuffer, indexBuffer, indicesLength, texture, modelViewMatrix, projectionMatrix, shaderProgram) {
	// Bind the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);

	// Bind the texture coordinate buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	var textureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
	gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoord);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Activate and bind the texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0);

	// Set the shader uniforms
	var uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
	var uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
	gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

	// Draw the Earth
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
}

//
//Satellite
//

var goldenColor = [1.0, 0.843, 0.0, 1.0]; // Golden color
var darkGreyColor = [0.2, 0.2, 0.2, 1.0]; // Dark grey color

function createCube(size) {
	var halfSize = size / 2;
	var vertices = [];
	var colors = [];
	// Define vertices for each face and assign colors
	// Front face (golden)
	vertices.push(...[-halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);

	// Back face (golden)
	vertices.push(...[-halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);

	// Top face (dark grey)
	vertices.push(...[-halfSize, halfSize, -halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...darkGreyColor);

	// Bottom face (dark grey)
	vertices.push(...[-halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...darkGreyColor);

	// Right face (golden)
	vertices.push(...[halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);

	// Left face (golden)
	vertices.push(...[-halfSize, -halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);

	// prettier-ignore
	var indices = [
		0,1,2,
		0,2,3, // front
		4,5,6,
		4,6,7, // back
		8,9,10,
		8,10,11, // top
		12,13,14,
		12,14,15, // bottom
		16,17,18,
        16,18,19, // right
		20,21,22,
		20,22,23 // left
	];
	return {
		vertices: vertices,
		colors: colors,
		indices: indices
	};
}

var mainBody = createCube(3); // The cube is 3x3x3

var cubeColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.colors), gl.STATIC_DRAW);

function drawCube(gl, vertexBuffer, colorBuffer, indexBuffer, indicesLength, modelViewMatrix, projectionMatrix, shaderProgram) {
	// Bind the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);

	// Bind the color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var vertexColor = gl.getAttribLocation(shaderProgram, 'aVertexColor');
	gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexColor);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Set the shader uniforms
	var uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
	var uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
	gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
}

// var solarPanel1 = createRectangularPlane(2.0, 5.0);
// var solarPanel2 = createRectangularPlane(2.0, 5.0);
// var connectionRod1 = createCylinder(0.2, 0.8);
// var connectionRod2 = createCylinder(0.2, 0.8);
// var antennaRod = createCylinder(0.3, 1.0);
// var antennaDish = createHemisphere(4.0); // let's make it a flat plate circle

/////////////////////////////////////////////////
//TODO

function createRodVertices(size, length) {
	// Scale the cube along one axis to make it look like a rod
	var scaledSize = [size, size, length];

	// Cube (Rod) vertices
	// prettier-ignore
	var vertices = [
        // Front face
        -scaledSize[0], -scaledSize[1],  scaledSize[2],
         scaledSize[0], -scaledSize[1],  scaledSize[2],
         scaledSize[0],  scaledSize[1],  scaledSize[2],
        -scaledSize[0],  scaledSize[1],  scaledSize[2],

        // Back face
        -scaledSize[0], -scaledSize[1], -scaledSize[2],
        -scaledSize[0],  scaledSize[1], -scaledSize[2],
         scaledSize[0],  scaledSize[1], -scaledSize[2],
         scaledSize[0], -scaledSize[1], -scaledSize[2],

        // Top face
        -scaledSize[0],  scaledSize[1], -scaledSize[2],
        -scaledSize[0],  scaledSize[1],  scaledSize[2],
         scaledSize[0],  scaledSize[1],  scaledSize[2],
         scaledSize[0],  scaledSize[1], -scaledSize[2],

        // Bottom face
        -scaledSize[0], -scaledSize[1], -scaledSize[2],
         scaledSize[0], -scaledSize[1], -scaledSize[2],
         scaledSize[0], -scaledSize[1],  scaledSize[2],
        -scaledSize[0], -scaledSize[1],  scaledSize[2],

        // Right face
         scaledSize[0], -scaledSize[1], -scaledSize[2],
         scaledSize[0],  scaledSize[1], -scaledSize[2],
         scaledSize[0],  scaledSize[1],  scaledSize[2],
         scaledSize[0], -scaledSize[1],  scaledSize[2],

        // Left face
        -scaledSize[0], -scaledSize[1], -scaledSize[2],
        -scaledSize[0], -scaledSize[1],  scaledSize[2],
        -scaledSize[0],  scaledSize[1],  scaledSize[2],
        -scaledSize[0],  scaledSize[1], -scaledSize[2]
    ];

	return vertices;
}

function createRodIndices() {
	// Cube (Rod) indices
	// prettier-ignore
	var indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
    ];

	return indices;
}

var rodSize = 0.2; // The width and height of the rod
var rodLength = 2.0; // The length of the rod
var rodVertices = createRodVertices(rodSize, rodLength);
var rodIndices = createRodIndices();

// Create a buffer for the rod's vertices
var rodVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rodVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rodVertices), gl.STATIC_DRAW);

// Create a buffer for the rod's indices
var rodIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rodIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rodIndices), gl.STATIC_DRAW);

//Create a function that has all the necessary functions to create the entire satellite

var cubeVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.vertices), gl.STATIC_DRAW);

var cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mainBody.indices), gl.STATIC_DRAW);

////////////////////////////////////////////////
//Define the Vertices for the Solar Panel

// set up the buffer to pass the vertices to the GPU.

var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.vertices), gl.STATIC_DRAW);

var textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.textureCoords), gl.STATIC_DRAW);

var indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereData.indices), gl.STATIC_DRAW);

// Satellite Buffers

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();

var satelliteAngle = 0;
var orbitRadius = 45;
var satelliteSpeed = 0.0002;
var satellitePosition = 0; // This will control the satellite's position independently

// Navigation control variables
var translation = [0, 0, -115]; // Initial translation
var rotation = [0, 0]; // Initial rotation
var then = 0;

function drawScene(now) {
	now *= 0.0002; // Convert timestamp for rotation
	const deltaTime = now - then;
	then = now;

	// Clear the canvas and the depth buffer
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Set up the perspective matrix
	mat4.perspective(projectionMatrix, (60 * Math.PI) / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000.0);

	// Base model-view matrix for navigation controls
	mat4.identity(modelViewMatrix);
	mat4.translate(modelViewMatrix, modelViewMatrix, translation);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[0], [1, 0, 0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[1], [0, 1, 0]);

	// Use the shader program
	gl.useProgram(shaderProgram);

	// Earth Model-View Matrix
	var earthModelViewMatrix = mat4.clone(modelViewMatrix);
	mat4.rotate(earthModelViewMatrix, earthModelViewMatrix, now, [0, 1, 0]); // Rotate the Earth over time

	gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uUseTexture'), true);
	drawEarth(gl, vertexBuffer, textureCoordBuffer, indexBuffer, sphereData.indices.length, earthTexture, earthModelViewMatrix, projectionMatrix, shaderProgram);

	// Satellite Model-View Matrix
	var satelliteModelViewMatrix = mat4.create();
	satellitePosition += satelliteSpeed;
	satelliteAngle = satellitePosition;
	mat4.translate(satelliteModelViewMatrix, modelViewMatrix, [orbitRadius * Math.cos(satelliteAngle), 0, orbitRadius * Math.sin(satelliteAngle)]);

	// Draw the satellite main body (cube)
	gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uUseTexture'), false);
	drawCube(gl, cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer, mainBody.indices.length, satelliteModelViewMatrix, projectionMatrix, shaderProgram);

	// Bind buffers for the rods
	gl.bindBuffer(gl.ARRAY_BUFFER, rodVertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rodIndexBuffer);

	// Set the positions for the rod vertices
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	// Calculate the transformation for the first rod
	var rodModelViewMatrix = mat4.create();
	mat4.translate(rodModelViewMatrix, satelliteModelViewMatrix, [0, 0, -15.5]); // Adjust this translation
	mat4.rotate(rodModelViewMatrix, rodModelViewMatrix, Math.PI / 2, [0, 3, 1]); // Rotate the rod if needed

	// Set the matrix uniforms
	gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, rodModelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);

	// Draw the rod
	gl.drawElements(gl.TRIANGLES, rodIndices.length, gl.UNSIGNED_SHORT, 0);

	// Request the next frame
	requestAnimationFrame(drawScene);
}

//
// CONTROLS
//

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

canvas.onmousedown = function (event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
};

document.onmouseup = function (event) {
	mouseDown = false;
};

canvas.onmousemove = function (event) {
	if (!mouseDown) {
		return;
	}
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;

	if (event.shiftKey) {
		translation[0] += deltaX / 100; // Adjust for x-translation sensitivity
	} else if (event.altKey) {
		translation[1] -= deltaY / 100; // Adjust for y-translation sensitivity
	} else {
		rotation[0] += deltaY / 100; // Adjust for x-rotation sensitivity
		rotation[1] += deltaX / 100; // Adjust for y-rotation sensitivity
	}
	lastMouseX = newX;
	lastMouseY = newY;
};

canvas.onwheel = function (event) {
	translation[2] += event.deltaY * 0.01; // Adjust for z-translation sensitivity
};

document.addEventListener('keydown', function (event) {
	if (event.key === 'ArrowLeft') {
		orbitRadius += 1; // Increase orbit radius
	} else if (event.key === 'ArrowRight') {
		orbitRadius = Math.max(35, orbitRadius - 1); //So it doesn't collide with the earth
	} else if (event.key === 'ArrowDown') {
		satelliteSpeed -= 0.001;
	} else if (event.key === 'ArrowUp') {
		satelliteSpeed += 0.001;
	}
});

requestAnimationFrame(drawScene);
