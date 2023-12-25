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
                     attribute vec3 aVertexNormal;
			         attribute vec2 aTextureCoord;
			         uniform mat4 uModelViewMatrix;
			         uniform mat4 uProjectionMatrix;
                     uniform mat3 uNormalMatrix;
                     uniform vec3 uLightDirection;
			         varying highp vec2 vTextureCoord;
                     varying lowp vec4 vColor;
                     varying highp vec3 vLighting; 
			         void main(void) {
			             gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			             vTextureCoord = aTextureCoord;
                         vColor = aVertexColor;
                         highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
                         highp vec3 directionalLightColor = vec3(1, 1, 1);
                         highp vec3 transformedNormal = normalize(uNormalMatrix * aVertexNormal);
                         highp float directional = max(dot(transformedNormal, normalize(uLightDirection)), 0.0);
                         vLighting = ambientLight + (directionalLightColor * directional);
			         }
			     `;

var fsSource = `
			         varying highp vec2 vTextureCoord;
                     varying lowp vec4 vColor;
                     varying highp vec3 vLighting;
			         uniform sampler2D uSampler;
                     uniform bool uUseTexture;
			         void main(void) {
                        if (uUseTexture) {
                            gl_FragColor = texture2D(uSampler, vTextureCoord);
                        } else {
                            gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
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

function createCube(size) {
	var halfSize = size / 2;
	var vertices = [];
	var colors = [];
	var normals = [];

	var goldenColor = [1.0, 0.843, 0.0, 1.0]; // Golden color
	var greyColor = [0.2, 0.2, 0.2, 1.0]; // Dark grey color

	// Front face (golden)
	vertices.push(...[-halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...greyColor);
	for (let i = 0; i < 4; i++) normals.push(...[0, 0, 1]); // Normal pointing outwards

	// Back face (golden)
	vertices.push(...[-halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...greyColor);
	for (let i = 0; i < 4; i++) normals.push(...[0, 0, -1]); // Normal pointing inwards

	// Top face (golden)
	vertices.push(...[-halfSize, halfSize, -halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);
	for (let i = 0; i < 4; i++) normals.push(...[0, 1, 0]); // Normal pointing upwards

	// Bottom face (golden)
	vertices.push(...[-halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);
	for (let i = 0; i < 4; i++) normals.push(...[0, -1, 0]); // Normal pointing downwards

	// Right face (grey)
	vertices.push(...[halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);
	for (let i = 0; i < 4; i++) normals.push(...[1, 0, 0]); // Normal pointing to the right

	// Left face (grey)
	vertices.push(...[-halfSize, -halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...goldenColor);
	for (let i = 0; i < 4; i++) normals.push(...[-1, 0, 0]); // Normal pointing to the left

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
		indices: indices,
		normals: normals
	};
}

var mainBody = createCube(3); // The cube is 3x3x3

var cubeVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.vertices), gl.STATIC_DRAW);

var cubeColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.colors), gl.STATIC_DRAW);

var cubeNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.normals), gl.STATIC_DRAW);

var cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mainBody.indices), gl.STATIC_DRAW);

function drawCube(gl, vertexBuffer, colorBuffer, indexBuffer, normalBuffer, indicesLength, modelViewMatrix, projectionMatrix, shaderProgram) {
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

	// Bind the normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	var vertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
	gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexNormal);

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
var rodLength = 4.6; // The length of the rod // 0.8 on each side + 3 of the cube
var rodVertices = createRodVertices(rodSize, rodLength);
var rodIndices = createRodIndices();

// Grey color for rods
var greyColor = [0.5, 0.5, 0.5, 1.0]; // RGBA for grey

// Create a buffer for the rod's vertices
var rodVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rodVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rodVertices), gl.STATIC_DRAW);

// Create a buffer for the rod's indices
var rodIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rodIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(rodIndices), gl.STATIC_DRAW);

// Create an array for rod colors (assuming each rod vertex requires a color entry)
var rodColors = new Array((rodVertices.length / 3) * 4).fill(greyColor).flat();

// Create and bind the color buffer for rods
var rodColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rodColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rodColors), gl.STATIC_DRAW);

//
//Create a function that has all the necessary functions to create the entire satellite

///TODO PACK IT INTO A FUNCTION
var cubeVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.vertices), gl.STATIC_DRAW);

var cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mainBody.indices), gl.STATIC_DRAW);

//Define the Vertices for the Solar Panel

/////////////////////////////////////// PANELS

function createSolarPanel(width, height) {
	var halfWidth = width / 2;
	var halfHeight = height / 2;

	// Vertices of the solar panel - a thin rectangle on the XY plane
	// prettier-ignore
	var vertices = [
        -halfWidth, -halfHeight, 0.0,  // bottom left
         halfWidth, -halfHeight, 0.0,  // bottom right
         halfWidth,  halfHeight, 0.0,  // top right
        -halfWidth,  halfHeight, 0.0   // top left
    ];

	// Color of the solar panels - bluish
	// prettier-ignore
	var colors = [
        0.0, 0.5, 1.0, 1.0,  // bottom left
        0.0, 0.5, 1.0, 1.0,  // bottom right
        0.0, 0.5, 1.0, 1.0,  // top right
        0.0, 0.5, 1.0, 1.0   // top left
    ];

	// Indices define two triangles that make up the rectangle
	// prettier-ignore
	var indices = [
        0, 1, 2,  // triangle 1
        0, 2, 3   // triangle 2
    ];

	return {
		vertices: vertices,
		colors: colors,
		indices: indices
	};
}

// Create buffers for the solar panel
var solarPanelData = createSolarPanel(2.0, 5.0);

var solarPanelVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, solarPanelVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(solarPanelData.vertices), gl.STATIC_DRAW);

var solarPanelColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, solarPanelColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(solarPanelData.colors), gl.STATIC_DRAW);

var solarPanelIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, solarPanelIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(solarPanelData.indices), gl.STATIC_DRAW);

function drawSolarPanel(gl, shaderProgram, modelViewMatrix, projectionMatrix) {
	// Set the position attribute
	gl.bindBuffer(gl.ARRAY_BUFFER, solarPanelVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	// Set the color attribute
	gl.bindBuffer(gl.ARRAY_BUFFER, solarPanelColorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	// Set the indices for drawing
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, solarPanelIndexBuffer);

	// Set uniforms
	gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);

	// Draw the solar panel
	gl.drawElements(gl.TRIANGLES, solarPanelData.indices.length, gl.UNSIGNED_SHORT, 0);
}

function createOctagonalPrism(diameter, length, color) {
	const angle = (2 * Math.PI) / 8; // octagon has 8 sides
	const radius = diameter / 2;
	let vertices = [];
	let colors = [];
	let indices = [];

	// Generate the vertices for the top and bottom faces
	for (let i = 0; i < 8; i++) {
		// Top vertices
		vertices.push(radius * Math.cos(i * angle), radius * Math.sin(i * angle), length / 2);
		// Bottom vertices
		vertices.push(radius * Math.cos(i * angle), radius * Math.sin(i * angle), -length / 2);

		// Same color for each vertex
		colors.push(...color); // top vertex color
		colors.push(...color); // bottom vertex color
	}

	// Generate the indices for the top and bottom faces
	for (let i = 0; i < 8; i++) {
		// Top face indices
		indices.push(i * 2, (i * 2 + 2) % 16, (i * 2 + 4) % 16);
		// Bottom face indices
		indices.push(i * 2 + 1, (i * 2 + 3) % 16, (i * 2 + 5) % 16);
	}

	// Generate the indices for the side faces
	for (let i = 0; i < 8; i++) {
		let next = (i + 1) % 8;
		indices.push(i * 2, next * 2, next * 2 + 1);
		indices.push(i * 2, next * 2 + 1, i * 2 + 1);
	}

	return {
		vertices: new Float32Array(vertices),
		colors: new Float32Array(colors),
		indices: new Uint16Array(indices)
	};
}

// Define colors
const grey = [0.5, 0.5, 0.5, 1.0];

// ---First rod
const rod1 = createOctagonalPrism(0.2, 0.8, grey);
const rod1VertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod1VertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod1.vertices, gl.STATIC_DRAW);

const rod1ColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod1ColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod1.colors, gl.STATIC_DRAW);

const rod1IndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rod1IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rod1.indices, gl.STATIC_DRAW);

// ---Second rod
const rod2 = createOctagonalPrism(0.2, 0.8, grey);
const rod2ColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod2ColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod2.colors, gl.STATIC_DRAW);

const rod2IndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rod2IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rod2.indices, gl.STATIC_DRAW);

// ---Third rod
const rod3 = createOctagonalPrism(0.2, 0.8, grey);

const rod3ColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod3ColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod3.colors, gl.STATIC_DRAW);

const rod3IndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rod3IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rod3.indices, gl.STATIC_DRAW);

function drawRod(gl, shaderProgram, vertexBuffer, colorBuffer, indexBuffer, indicesLength, modelViewMatrix, projectionMatrix) {
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
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'), false, modelViewMatrix);
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'), false, projectionMatrix);

	// Draw the rod
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
}

///////////////////////////////////////////////////////////////

function createAntennaDish(radius, color) {
	var vertices = [];
	var colors = [];
	var indices = [];
	var sliceCount = 32; // Number of slices to approximate the circle

	// Center of the dish
	vertices.push(0.0, 0.0, 0.0);
	colors.push(...color);

	for (var i = 0; i <= sliceCount; i++) {
		var angle = (i * 2 * Math.PI) / sliceCount;
		var x = radius * Math.cos(angle);
		var y = radius * Math.sin(angle);

		vertices.push(x, y, 0.0); // Z is 0 because the dish is flat
		colors.push(...color);

		if (i > 0) {
			indices.push(0, i, i + 1);
		}
	}

	return {
		vertices: new Float32Array(vertices),
		colors: new Float32Array(colors),
		indices: new Uint16Array(indices)
	};
}

var goldenColor = [1.0, 0.843, 0.0, 1.0];
var antennaDishData = createAntennaDish(2.0, goldenColor); // Radius 2.0 for diameter 4.0

var antennaDishVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, antennaDishVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, antennaDishData.vertices, gl.STATIC_DRAW);

var antennaDishColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, antennaDishColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, antennaDishData.colors, gl.STATIC_DRAW);

var antennaDishIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, antennaDishIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, antennaDishData.indices, gl.STATIC_DRAW);

function drawAntennaDish(gl, shaderProgram, vertexBuffer, colorBuffer, indexBuffer, indicesLength, modelViewMatrix, projectionMatrix) {
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

	// Set the shader uniforms for the model-view and projection matrices
	gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);

	// Draw the antenna dish
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
}

///////////////////////////////////////////////////////////////

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

	then = now;

	// Clear the canvas and the depth buffer
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Calculate the light direction
	var lightDirection = vec3.create();
	vec3.set(lightDirection, Math.cos((60 * Math.PI) / 180), -Math.sin((60 * Math.PI) / 180), 0); // Top-right light
	gl.uniform3fv(gl.getUniformLocation(shaderProgram, 'uLightDirection'), lightDirection);

	// Calculate and pass the normal matrix
	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, modelViewMatrix);
	gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, 'uNormalMatrix'), false, normalMatrix);

	// Set up the perspective matrix
	mat4.perspective(projectionMatrix, (60 * Math.PI) / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000.0);

	// Base model-view matrix for navigation controls
	mat4.identity(modelViewMatrix);
	mat4.translate(modelViewMatrix, modelViewMatrix, translation);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[0], [1, 0, 0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[1], [0, 1, 0]);

	// Use the shader program
	gl.useProgram(shaderProgram);

	// Initialize shader program attributes
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
	shaderProgram.uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
	shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');

	// Earth Model-View Matrix
	var earthModelViewMatrix = mat4.clone(modelViewMatrix);
	mat4.rotate(earthModelViewMatrix, earthModelViewMatrix, now, [0, 1, 0]); // Rotate the Earth over time

	gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uUseTexture'), true);
	drawEarth(gl, vertexBuffer, textureCoordBuffer, indexBuffer, sphereData.indices.length, earthTexture, earthModelViewMatrix, projectionMatrix, shaderProgram);

	// Satellite calculations Which will always face the earth
	satellitePosition += satelliteSpeed;
	satelliteAngle = satellitePosition;
	var satelliteX = orbitRadius * Math.cos(satelliteAngle);
	var satelliteZ = orbitRadius * Math.sin(satelliteAngle);
	var satelliteModelViewMatrix = mat4.create();
	mat4.translate(satelliteModelViewMatrix, modelViewMatrix, [satelliteX, 0, satelliteZ]);
	var satelliteAngleToEarth = (2 * Math.PI - satelliteAngle) % (2 * Math.PI);
	mat4.rotate(satelliteModelViewMatrix, satelliteModelViewMatrix, satelliteAngleToEarth, [0, 1, 0]);

	// SATELLITE - MAIN BODY
	gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uUseTexture'), false);
	drawCube(gl, cubeVertexBuffer, cubeColorBuffer, cubeIndexBuffer, mainBody.indices.length, satelliteModelViewMatrix, projectionMatrix, shaderProgram);

	// SATELLITE - RODS SETUP
	// ROD 1
	var rod1ModelViewMatrix = mat4.create();
	mat4.translate(rod1ModelViewMatrix, satelliteModelViewMatrix, [0, 0, 2]);
	drawRod(gl, shaderProgram, rod1VertexBuffer, rod1ColorBuffer, rod1IndexBuffer, rod1.indices.length, rod1ModelViewMatrix, projectionMatrix);

	// ROD 2
	var rod2ModelViewMatrix = mat4.create();
	mat4.translate(rod2ModelViewMatrix, satelliteModelViewMatrix, [0, 0, -2]);
	drawRod(gl, shaderProgram, rod1VertexBuffer, rod2ColorBuffer, rod2IndexBuffer, rod2.indices.length, rod2ModelViewMatrix, projectionMatrix);

	// ROD 3
	var rod3ModelViewMatrix = mat4.create();
	mat4.translate(rod3ModelViewMatrix, satelliteModelViewMatrix, [-2, 0, 0]);
	mat4.rotateY(rod3ModelViewMatrix, rod3ModelViewMatrix, Math.PI / 2);
	drawRod(gl, shaderProgram, rod1VertexBuffer, rod3ColorBuffer, rod3IndexBuffer, rod3.indices.length, rod3ModelViewMatrix, projectionMatrix);

	// SATELLITE - DISH
	var antennaDishModelViewMatrix = mat4.create();
	mat4.translate(antennaDishModelViewMatrix, rod3ModelViewMatrix, [0, 0, -0.75]);
	drawAntennaDish(gl, shaderProgram, antennaDishVertexBuffer, antennaDishColorBuffer, antennaDishIndexBuffer, antennaDishData.indices.length, antennaDishModelViewMatrix, projectionMatrix);

	// SATELLITE - SOLAR PANNELS

	// LEFT PANNEL
	var leftSolarPanelMVMatrix = mat4.clone(satelliteModelViewMatrix);
	mat4.translate(leftSolarPanelMVMatrix, leftSolarPanelMVMatrix, [-rodSize, 0, rodLength / 2 + 2.5]); // Added offset for the solar panel size
	mat4.rotateX(leftSolarPanelMVMatrix, leftSolarPanelMVMatrix, Math.PI / 2); // Rotate to make it face upwards
	drawSolarPanel(gl, shaderProgram, leftSolarPanelMVMatrix, projectionMatrix);

	// RIGHT PANNEL
	var rightSolarPanelMVMatrix = mat4.clone(satelliteModelViewMatrix);
	mat4.translate(rightSolarPanelMVMatrix, rightSolarPanelMVMatrix, [rodSize, 0, rodLength / 2 - 7.25]);
	mat4.rotateX(rightSolarPanelMVMatrix, rightSolarPanelMVMatrix, Math.PI / 2); // Rotate to make it face upwards
	drawSolarPanel(gl, shaderProgram, rightSolarPanelMVMatrix, projectionMatrix);

	// Disable the vertex attribute arrays
	gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

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
