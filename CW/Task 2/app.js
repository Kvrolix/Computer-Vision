import {
	ATTR_VERTEX_POSITION,
	ATTR_VERTEX_COLOR,
	ATTR_VERTEX_NORMAL,
	UNIFORM_MODEL_VIEW_MATRIX,
	UNIFORM_PROJECTION_MATRIX,
	UNIFORM_NORMAL_MATRIX,
	UNIFORM_LIGHT_DIRECTION,
	UNIFORM_SAMPLER,
	UNIFORM_USE_TEXTURE,
	SATELLITE_ORBIT_RADIUS,
	INITIAL_TRANSLATION,
	INITIAL_ROTATION,
	BLACK_COLOR,
	GREY_COLOR,
	DARK_GREY_COLOR,
	GOLD_COLOR
} from './helper.js';
var canvas = document.getElementById('webglCanvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

var gl = canvas.getContext('webgl');
if (!gl) {
	alert('WebGL not supported');
	throw new Error('WebGL not supported');
}

function getShaderSource(id) {
	const shaderScript = document.getElementById(id);
	if (!shaderScript) {
		console.error(`Unable to find shader source with id ${id}`);
		return null;
	}
	return shaderScript.text;
}

const vertexShaderSource = getShaderSource('vertex-shader');
const fragmentShaderSource = getShaderSource('fragment-shader');

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

var shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

// Function to create the sphere
function createSphereData(radius, latitudeBands, longitudeBands) {
	let vertices = [],
		normals = [],
		textureCoords = [],
		indices = [];

	for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		let theta = (latNumber * Math.PI) / latitudeBands;
		let sinTheta = Math.sin(theta);
		let cosTheta = Math.cos(theta);

		for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			let phi = (longNumber * 2 * Math.PI) / longitudeBands;
			let sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);

			let x = cosPhi * sinTheta;
			let y = cosTheta;
			let z = sinPhi * sinTheta;
			let u = 1 - longNumber / longitudeBands;
			let v = latNumber / latitudeBands; // Flipping texture

			normals.push(x);
			normals.push(y);
			normals.push(z);
			textureCoords.push(u);
			textureCoords.push(v);
			vertices.push(radius * x);
			vertices.push(radius * y);
			vertices.push(radius * z);
		}
	}

	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
			let first = latNumber * (longitudeBands + 1) + longNumber;
			let second = first + longitudeBands + 1;
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
		normals: normals,
		textureCoords: textureCoords,
		indices: indices
	};
}

const sphereData = createSphereData(30, 80, 80);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.vertices), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.normals), gl.STATIC_DRAW);

const textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData.textureCoords), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereData.indices), gl.STATIC_DRAW);

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	let level = 0;
	let internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]);
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
const earthTexture = loadTexture(gl, 'earth.jpg');

function drawEarth(gl, vertexBuffer, normalBuffer, textureCoordBuffer, indexBuffer, indicesLength, texture, modelViewMatrix, projectionMatrix, shaderProgram) {
	// Bind the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	const vertexPosition = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_POSITION);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);

	// Bind the normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	const vertexNormal = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_NORMAL);
	gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexNormal);

	// Bind the texture coordinate buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	const textureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
	gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(textureCoord);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Activate and bind the texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(gl.getUniformLocation(shaderProgram, UNIFORM_SAMPLER), 0);

	// Set the shader uniforms
	const uModelViewMatrix = gl.getUniformLocation(shaderProgram, UNIFORM_MODEL_VIEW_MATRIX);
	const uProjectionMatrix = gl.getUniformLocation(shaderProgram, UNIFORM_PROJECTION_MATRIX);
	gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

	// Draw the Earth
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
}

// SATELLITE - MAIN BODY

function createCube(size) {
	let halfSize = size / 2;
	let vertices = [],
		colors = [],
		normals = [];

	// Front face (golden)
	vertices.push(...[-halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...DARK_GREY_COLOR);
	for (let i = 0; i < 4; i++) normals.push(...[0, 0, 1]); // Normal pointing outwards

	// Back face (golden)
	vertices.push(...[-halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...DARK_GREY_COLOR);
	for (let i = 0; i < 4; i++) normals.push(...[0, 0, -1]); // Normal pointing inwards

	// Top face (golden)
	vertices.push(...[-halfSize, halfSize, -halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...GOLD_COLOR);
	for (let i = 0; i < 4; i++) normals.push(...[0, 1, 0]); // Normal pointing upwards

	// Bottom face (golden)
	vertices.push(...[-halfSize, -halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, -halfSize, -halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...GOLD_COLOR);
	for (let i = 0; i < 4; i++) normals.push(...[0, -1, 0]); // Normal pointing downwards

	// Right face (grey)
	vertices.push(...[halfSize, -halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, halfSize, halfSize, halfSize, -halfSize, halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...GOLD_COLOR);
	for (let i = 0; i < 4; i++) normals.push(...[1, 0, 0]); // Normal pointing to the right

	// Left face (grey)
	vertices.push(...[-halfSize, -halfSize, -halfSize, -halfSize, -halfSize, halfSize, -halfSize, halfSize, halfSize, -halfSize, halfSize, -halfSize]);
	for (let i = 0; i < 4; i++) colors.push(...GOLD_COLOR);
	for (let i = 0; i < 4; i++) normals.push(...[-1, 0, 0]); // Normal pointing to the left

	// prettier-ignore
	const indices = [
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

const mainBody = createCube(3); // The cube is 3x3x3

const cubeVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.vertices), gl.STATIC_DRAW);

const cubeColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.colors), gl.STATIC_DRAW);

const cubeNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mainBody.normals), gl.STATIC_DRAW);

var cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mainBody.indices), gl.STATIC_DRAW);

function drawCube(gl, vertexBuffer, colorBuffer, normalBuffer, indexBuffer, indicesLength, modelViewMatrix, projectionMatrix, shaderProgram) {
	// Bind the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	const vertexPosition = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_POSITION);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);

	// Bind the color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var vertexColor = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_COLOR);
	gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexColor);

	// Bind the normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	var vertexNormal = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_NORMAL);
	gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexNormal);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Set the shader uniforms for model-view and projection matrices
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, UNIFORM_MODEL_VIEW_MATRIX), false, modelViewMatrix);
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, UNIFORM_PROJECTION_MATRIX), false, projectionMatrix);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);

	// Clean up
	gl.disableVertexAttribArray(vertexPosition);
	gl.disableVertexAttribArray(vertexColor);
	gl.disableVertexAttribArray(vertexNormal);
}

// SATELLITE - RODS

function createRodData(diameter, length, color) {
	const angle = (2 * Math.PI) / 8; // octagon has 8 sides
	const radius = diameter / 2;
	let vertices = [];
	let normals = [];
	let colors = [];
	let indices = [];

	// Generate vertices, normals, and indices
	for (let i = 0; i < 8; i++) {
		let nextI = (i + 1) % 8;
		let angle1 = i * angle;
		let angle2 = nextI * angle;

		// Normal for the side faces
		let normalX = Math.cos(angle1 + angle / 2);
		let normalY = Math.sin(angle1 + angle / 2);

		// Top vertices
		vertices.push(radius * Math.cos(angle1), radius * Math.sin(angle1), length / 2);
		normals.push(normalX, normalY, 0);
		colors.push(...color);

		vertices.push(radius * Math.cos(angle2), radius * Math.sin(angle2), length / 2);
		normals.push(normalX, normalY, 0);
		colors.push(...color);

		// Bottom vertices
		vertices.push(radius * Math.cos(angle2), radius * Math.sin(angle2), -length / 2);
		normals.push(normalX, normalY, 0);
		colors.push(...color);

		vertices.push(radius * Math.cos(angle1), radius * Math.sin(angle1), -length / 2);
		normals.push(normalX, normalY, 0);
		colors.push(...color);

		// Indices
		let base = i * 4;
		indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
	}

	return {
		vertices: new Float32Array(vertices),
		normals: new Float32Array(normals),
		colors: new Float32Array(colors),
		indices: new Uint16Array(indices)
	};
}

// ---First rod
const rod1 = createRodData(0.2, 0.8, GREY_COLOR);

const rod1VertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod1VertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod1.vertices, gl.STATIC_DRAW);

const rod1ColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod1ColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod1.colors, gl.STATIC_DRAW);

const rod1NormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod1NormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod1.normals, gl.STATIC_DRAW);

const rod1IndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rod1IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rod1.indices, gl.STATIC_DRAW);

// ---Second rod
const rod2 = createRodData(0.2, 0.8, GREY_COLOR);

const rod2ColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod2ColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod2.colors, gl.STATIC_DRAW);

const rod2NormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod2NormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod2.normals, gl.STATIC_DRAW);

const rod2IndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rod2IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rod2.indices, gl.STATIC_DRAW);

// ---Third rod
const rod3 = createRodData(0.2, 0.8, GREY_COLOR);

const rod3ColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod3ColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod3.colors, gl.STATIC_DRAW);

const rod3NormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rod3NormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rod3.normals, gl.STATIC_DRAW);

const rod3IndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, rod3IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rod3.indices, gl.STATIC_DRAW);

function drawRod(gl, shaderProgram, vertexBuffer, colorBuffer, normalBuffer, indexBuffer, indicesLength, modelViewMatrix, projectionMatrix) {
	// Bind the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertexPosition = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_POSITION);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);

	// Bind the color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var vertexColor = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_COLOR);
	gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexColor);

	// Bind the normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	var vertexNormal = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_NORMAL);
	gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexNormal);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Set the shader uniforms
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, UNIFORM_MODEL_VIEW_MATRIX), false, modelViewMatrix);
	gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, UNIFORM_PROJECTION_MATRIX), false, projectionMatrix);

	// Draw the rod
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);

	gl.disableVertexAttribArray(vertexNormal);
}

// SATELLITE - SOLAR PANNEL

function createSolarPanel(width, height) {
	var halfWidth = width / 2;
	var halfHeight = height / 2;
	var normals = [];

	// Vertices of the solar panel - a thin rectangle on the XY plane
	// prettier-ignore
	var vertices = [
        -halfWidth, -halfHeight, 0.0,  // bottom left
         halfWidth, -halfHeight, 0.0,  // bottom right
         halfWidth,  halfHeight, 0.0,  // top right
        -halfWidth,  halfHeight, 0.0   // top left
    ];

	// Color of the solar panels - blue
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
	for (let i = 0; i < 4; i++) {
		normals.push(0, 1, 0); // Normal pointing up
	}

	return {
		vertices: vertices,
		colors: colors,
		indices: indices,
		normals: new Float32Array(normals)
	};
}

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

var solarPanelNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, solarPanelNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, solarPanelData.normals, gl.STATIC_DRAW);

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

	// Set the normal attribute
	gl.bindBuffer(gl.ARRAY_BUFFER, solarPanelNormalBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	// Draw the solar panel
	gl.drawElements(gl.TRIANGLES, solarPanelData.indices.length, gl.UNSIGNED_SHORT, 0);
}

// SATELLITE - ANTENNA DISH

function createAntennaDish(radius, color) {
	var vertices = [];
	var colors = [];
	var indices = [];
	var normals = [];
	var sliceCount = 32; // Number of slices to approximate the circle

	// Center of the dish
	vertices.push(0.0, 0.0, 0.0);
	colors.push(...color);

	for (var i = 0; i <= sliceCount; i++) {
		var angle = (i * 2 * Math.PI) / sliceCount;
		var x = radius * Math.cos(angle);
		var y = radius * Math.sin(angle);

		vertices.push(x, y, 0); // Z is 0 because the dish is flat
		colors.push(...color);

		if (i > 0) {
			indices.push(0, i, i + 1);
		}
	}
	normals.push(0.0, 0.0, -1.0); // Center normal
	for (var i = 0; i <= sliceCount; i++) {
		normals.push(0.0, 0.0, -1.0); // Perimeter normals
	}

	return {
		vertices: new Float32Array(vertices),
		colors: new Float32Array(colors),
		indices: new Uint16Array(indices),
		normals: new Float32Array(normals)
	};
}

var antennaDishData = createAntennaDish(2.0, GOLD_COLOR); // Radius 2.0 for diameter 4.0
// Buffer for vertices
var antennaDishVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, antennaDishVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, antennaDishData.vertices, gl.STATIC_DRAW);

// Buffer for normals
var antennaDishNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, antennaDishNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, antennaDishData.normals, gl.STATIC_DRAW);

// Buffer for colors
var antennaDishColorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, antennaDishColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, antennaDishData.colors, gl.STATIC_DRAW);

// Buffer for indices
var antennaDishIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, antennaDishIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, antennaDishData.indices, gl.STATIC_DRAW);

function drawAntennaDish(gl, shaderProgram, vertexBuffer, colorBuffer, normalBuffer, indexBuffer, indicesLength, modelViewMatrix, projectionMatrix) {
	// Bind the vertex buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	var vertexPosition = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_POSITION);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexPosition);

	// Bind the color buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	var vertexColor = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_COLOR);
	gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexColor);

	// Bind the normal buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	var vertexNormal = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_NORMAL);
	gl.vertexAttribPointer(vertexNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vertexNormal);

	// Update normal matrix for the antenna dish
	var dishNormalMatrix = mat3.create();
	mat3.normalFromMat4(dishNormalMatrix, modelViewMatrix);
	gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, UNIFORM_NORMAL_MATRIX), false, dishNormalMatrix);

	// Bind the index buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// Set the shader uniforms for the model-view and projection matrices
	gl.uniformMatrix4fv(shaderProgram.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(shaderProgram.uProjectionMatrix, false, projectionMatrix);

	// Draw the antenna dish
	gl.drawElements(gl.TRIANGLES, indicesLength, gl.UNSIGNED_SHORT, 0);
}

var modelViewMatrix = mat4.create();
var projectionMatrix = mat4.create();

// SATELLITE - SETTINGS
var satelliteAngle = 0;
var orbitRadius = SATELLITE_ORBIT_RADIUS;
var satelliteSpeed = 0.0002;
// var satelliteSpeed = 0;
var satellitePosition = 0; // This will control the satellite's position independently

// Navigation control variables
var translation = INITIAL_TRANSLATION; // Initial translation
var rotation = INITIAL_ROTATION; // Initial rotation
var then = 0;
function drawScene(now) {
	now *= 0.0002; // timestamp for rotation
	then = now;

	// Clear the canvas and the depth buffer
	gl.clearColor(...BLACK_COLOR); //Black
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Set the light direction (top-right at a 60-degree angle)
	var angle = 60 * (Math.PI / 180); // Converting 60 degrees to radians
	var lightDirection = [0, Math.cos(angle), Math.sin(angle)]; // Light direction with a 60-degree tilt

	gl.uniform3fv(gl.getUniformLocation(shaderProgram, UNIFORM_LIGHT_DIRECTION), lightDirection);

	// Calculate and pass the normal matrix
	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, modelViewMatrix);
	gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, UNIFORM_NORMAL_MATRIX), false, normalMatrix);

	// Set up the perspective matrix
	mat4.perspective(projectionMatrix, (60 * Math.PI) / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000);

	// Base model-view matrix for navigation controls
	mat4.identity(modelViewMatrix);
	mat4.translate(modelViewMatrix, modelViewMatrix, translation);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[0], [1, 0, 0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, rotation[1], [0, 1, 0]);

	// Use the shader program
	gl.useProgram(shaderProgram);

	// Initialize shader program attributes
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_POSITION);
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_COLOR);
	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, ATTR_VERTEX_NORMAL);
	shaderProgram.uModelViewMatrix = gl.getUniformLocation(shaderProgram, UNIFORM_MODEL_VIEW_MATRIX);
	shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, UNIFORM_PROJECTION_MATRIX);
	shaderProgram.uNormalMatrix = gl.getUniformLocation(shaderProgram, UNIFORM_NORMAL_MATRIX);

	// Earth Model-View Matrix
	var earthModelViewMatrix = mat4.clone(modelViewMatrix);
	mat4.rotate(earthModelViewMatrix, earthModelViewMatrix, now, [0, 1, 0]); // Rotate the Earth over time

	// Calculate and pass the normal matrix for Earth
	var normalMatrix = mat3.create();
	mat3.normalFromMat4(normalMatrix, earthModelViewMatrix);
	gl.uniformMatrix3fv(gl.getUniformLocation(shaderProgram, UNIFORM_NORMAL_MATRIX), false, normalMatrix);

	gl.uniform1i(gl.getUniformLocation(shaderProgram, UNIFORM_USE_TEXTURE), true);
	drawEarth(gl, vertexBuffer, normalBuffer, textureCoordBuffer, indexBuffer, sphereData.indices.length, earthTexture, earthModelViewMatrix, projectionMatrix, shaderProgram);

	// Satellite calculations Which will always face the earth
	satellitePosition += satelliteSpeed;
	satelliteAngle = satellitePosition;
	var satelliteX = orbitRadius * Math.cos(satelliteAngle);
	var satelliteZ = orbitRadius * Math.sin(satelliteAngle);
	var satelliteModelViewMatrix = mat4.create();
	mat4.translate(satelliteModelViewMatrix, modelViewMatrix, [satelliteX, 0, satelliteZ]);
	var satelliteAngleToEarth = (2 * Math.PI - satelliteAngle) % (2 * Math.PI);
	mat4.rotate(satelliteModelViewMatrix, satelliteModelViewMatrix, satelliteAngleToEarth, [0, 1, 0]);

	// Normal matrix for the cube
	var normalMatrix = mat4.create();
	mat4.invert(normalMatrix, satelliteModelViewMatrix);
	mat4.transpose(normalMatrix, normalMatrix);

	// SATELLITE - MAIN BODY
	gl.uniform1i(gl.getUniformLocation(shaderProgram, UNIFORM_USE_TEXTURE), false);
	gl.uniformMatrix4fv(shaderProgram.uNormalMatrix, false, normalMatrix);
	drawCube(gl, cubeVertexBuffer, cubeColorBuffer, cubeNormalBuffer, cubeIndexBuffer, mainBody.indices.length, satelliteModelViewMatrix, projectionMatrix, shaderProgram);

	// SATELLITE - RODS SETUP
	// ROD 1
	var rod1ModelViewMatrix = mat4.create();
	mat4.translate(rod1ModelViewMatrix, satelliteModelViewMatrix, [0, 0, 1.9]);
	drawRod(gl, shaderProgram, rod1VertexBuffer, rod1ColorBuffer, rod1NormalBuffer, rod1IndexBuffer, rod1.indices.length, rod1ModelViewMatrix, projectionMatrix);

	// ROD 2
	var rod2ModelViewMatrix = mat4.create();
	mat4.translate(rod2ModelViewMatrix, satelliteModelViewMatrix, [0, 0, -1.9]);
	drawRod(gl, shaderProgram, rod1VertexBuffer, rod2ColorBuffer, rod2NormalBuffer, rod2IndexBuffer, rod2.indices.length, rod2ModelViewMatrix, projectionMatrix);

	// ROD 3
	var rod3ModelViewMatrix = mat4.create();
	mat4.translate(rod3ModelViewMatrix, satelliteModelViewMatrix, [-1.9, 0, 0]);
	mat4.rotateY(rod3ModelViewMatrix, rod3ModelViewMatrix, Math.PI / 2);
	drawRod(gl, shaderProgram, rod1VertexBuffer, rod3ColorBuffer, rod3NormalBuffer, rod3IndexBuffer, rod3.indices.length, rod3ModelViewMatrix, projectionMatrix);

	// SATELLITE - DISH
	var antennaDishModelViewMatrix = mat4.create();
	mat4.translate(antennaDishModelViewMatrix, rod3ModelViewMatrix, [0, 0, -0.5]);
	drawAntennaDish(
		gl,
		shaderProgram,
		antennaDishVertexBuffer,
		antennaDishColorBuffer,
		antennaDishNormalBuffer,
		antennaDishIndexBuffer,
		antennaDishData.indices.length,
		antennaDishModelViewMatrix,
		projectionMatrix
	);

	// SATELLITE - SOLAR PANNELS

	// LEFT PANNEL
	var leftSolarPanelMVMatrix = mat4.clone(satelliteModelViewMatrix);
	mat4.translate(leftSolarPanelMVMatrix, leftSolarPanelMVMatrix, [0, 0, 4.8]); // Added offset for the solar panel size
	mat4.rotateX(leftSolarPanelMVMatrix, leftSolarPanelMVMatrix, Math.PI / 2); // Rotate to make it face upwards
	drawSolarPanel(gl, shaderProgram, leftSolarPanelMVMatrix, projectionMatrix);

	// RIGHT PANNEL
	var rightSolarPanelMVMatrix = mat4.clone(satelliteModelViewMatrix);
	mat4.translate(rightSolarPanelMVMatrix, rightSolarPanelMVMatrix, [0, 0, -4.8]);
	mat4.rotateX(rightSolarPanelMVMatrix, rightSolarPanelMVMatrix, Math.PI / 2); // Rotate to make it face upwards
	drawSolarPanel(gl, shaderProgram, rightSolarPanelMVMatrix, projectionMatrix);

	// Disable the vertex attribute arrays
	gl.disableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

	// Request the next frame
	requestAnimationFrame(drawScene);
}

// DOCUMENT VISUAL CONTROLS

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
		translation[0] += deltaX / 100;
	} else if (event.altKey) {
		translation[1] -= deltaY / 100;
	} else {
		rotation[0] += deltaY / 100;
		rotation[1] += deltaX / 100;
	}
	lastMouseX = newX;
	lastMouseY = newY;
};

canvas.onwheel = function (event) {
	translation[2] += event.deltaY * 0.01;
};

document.addEventListener('keydown', function (event) {
	if (event.key === 'ArrowLeft') {
		orbitRadius += 1; // Increase orbit radius
	} else if (event.key === 'ArrowRight') {
		orbitRadius = Math.max(35, orbitRadius - 1); //Max value set for satellite to not collide with the earth
	} else if (event.key === 'ArrowDown') {
		satelliteSpeed = Math.max(0, satelliteSpeed - 0.001);
	} else if (event.key === 'ArrowUp') {
		satelliteSpeed += 0.001;
	} else if (event.key === ' ') {
		satelliteSpeed = 0;
	}
});

requestAnimationFrame(drawScene);
