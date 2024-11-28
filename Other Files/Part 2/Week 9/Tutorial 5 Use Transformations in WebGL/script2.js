/** @format */

'use strict';
//STEP 1 Define global variables here
var gl;
var canvas;
var vertexBuffer;
var shaderProgram;
var triangleVertexBuffer;
var triangleVertexColorBuffer;

var hexagonVertexBuffer;
var stripVertexBuffer;
var stripElementBuffer;

//Create WebGL context. Recall that we have use getContext("2D")
//to create a 2D context for drawing 2D graphics
function createGLContext(canvas) {
	var names = ['webgl', 'experimental-webgl'];
	var context = null;
	for (var i = 0; i < names.length; i++) {
		try {
			context = canvas.getContext(names[i]);
		} catch (e) { }
		if (context) {
			break;
		}
	}

	if (context) {
		context.viewportWidth = canvas.width;
		context.viewportHeight = canvas.height;
	} else {
		alert('Failed to create WebGL context!');
	}
	return context;
}

//Load shaders from DOM (document object model). This function will be //called in setupShaders(). The parameters for argument id will be //"shader-vs" and "shader-fs"

function loadShaderFromDOM(id) {
	var shaderScript = document.getElementById(id);

	// If there is no shader scripts, the function exist
	if (!shaderScript) {
		return null;
	}
	// Otherwise loop through the children for the found DOM element and
	// build up the shader source code as a string
	var shaderSource = '';
	var currentChild = shaderScript.firstChild;
	while (currentChild) {
		if (currentChild.nodeType == 3) {
			// 3 corresponds to TEXT_NODE
			shaderSource += currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}

	//Create a WebGL shader object according to type of shader, i.e., //vertex or fragment shader.
	var shader;
	if (shaderScript.type == 'x-shader/x-fragment') {
		//call WebGL function createShader() to create fragment
		//shader object
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == 'x-shader/x-vertex') {
		//call WebGL function createShader() to create vertx shader obj.
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	//load the shader source code (shaderSource) to the shader object.
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader); //compile the shader

	//check compiling status.
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

function setupShaders() {
	vertexShader = loadShaderFromDOM('shader-vs');
	fragmentShader = loadShaderFromDOM('shader-fs');
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Failed to setup shaders');
	}
	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	// get the pointer to “aVertexColor” variable in the vertex shader.
	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
	// Enable the vertexColorAttribute,(i.e., aVertexColor, in the vertex
	// shader so that we draw the triangle use the per-vertex color. The same
	// as did with the vertex coordinates.
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

//Buffers are places for data. All data, e.g., vertex coordinates,
//texture coordinates, indices, colours must be stored in their
//buffers. Here, the buffer is for the vertex coordinates of a triangle

function setupBuffers() {
	// update the triangle vertex position data used last week
	// because we have changed its size and location
	triangleVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
	var triangleVertices = [
		0.3,
		0.4,
		0.0, //v0
		0.7,
		0.4,
		0.0, //v1
		0.5,
		0.8,
		0.0, //v2
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
	triangleVertexBuffer.itemSize = 3;
	triangleVertexBuffer.numberOfItems = 3;
	// Triangle vertex colours
	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	var colors = [
		1.0,
		0.0,
		0.0,
		1.0, //v0
		0.0,
		1.0,
		0.0,
		1.0, //v1
		0.0,
		0.0,
		1.0,
		1.0, //v2
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 4;
	triangleVertexColorBuffer.numberOfItems = 3;

	//hexagon vertices
	hexagonVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
	//prettier-ignore
	var hexagonVertices = [
		-0.3,
		0.6,
		0.0, //v0
		-0.4,
		0.8,
		0.0, //v1
		-0.6,
		0.8,
		0.0, //v2
		-0.7,
		0.6,
		0.0, //v3
		-0.6,
		0.4,
		0.0, //v4
		-0.4,
		0.4,
		0.0, //v5
		-0.3,
		0.6,
		0.0, //v6
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hexagonVertices), gl.STATIC_DRAW);
	hexagonVertexBuffer.itemSize = 3;
	hexagonVertexBuffer.numberOfItems = 7;

	//Triangle strip vertices.
	stripVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, stripVertexBuffer);
	// prettier-ignore
	var stripVertices = [
		-0.5, 0.2, 0.0, //v0 
		0.4, 0.0, 0.0, //v1
		-0.3, 0.2, 0.0, //v2
		-0.2, 0.0, 0.0, //v3
		-0.1, 0.2, 0.0, //v4
		0.0, 0.0, 0.0, //v5
		0.1, 0.2, 0.0, //v6
		0.2, 0.0, 0.0, //v7
		0.3, 0.2, 0.0, //v8
		0.4, 0.0, 0.0, //v9
		0.5, 0.2, 0.0, //v10 wierzcholek 11 wiercholkow / 3 = 3 trojkaty i 2 vertices
		// Second strip
		-0.5, -0.3, 0.0, //v11
		-0.4, -0.5, 0.0, //v12
		-0.3, -0.3, 0.0, //v13
		-0.2, -0.5, 0.0, //v14
		-0.1, -0.3, 0.0, //v15
		0.0, -0.5, 0.0, //v16
		0.1, -0.3, 0.0, //v17
		0.2, -0.5, 0.0, //v18
		0.3, -0.3, 0.0, //v19
		0.4, -0.5, 0.0, //v20
		0.5, -0.3, 0.0, //v21
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stripVertices), gl.STATIC_DRAW);
	stripVertexBuffer.itemSize = 3;
	stripVertexBuffer.numberOfItems = 22;

	// Strip vertex indices
	stripElementBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripElementBuffer);

	var indices = [
		0, 1, 2,
		2, 1, 3,

		2, 3, 4,
		4, 3, 5,

		4, 5, 6,
		6, 5, 7,

		6, 7, 8,
		8, 7, 9,

		8, 9, 10,//ENd of strip 1
		10, 9, 10,

		10, 10, 10,
		10, 10, 11,

		10, 11, 11,
		11, 11, 12,

		11, 12, 13,
		13, 12, 14,

		13, 14, 15,
		15, 14, 16,

		15, 16, 17,
		17, 16, 18,

		17, 18, 19,
		19, 18, 20,

		19, 20, 21


	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	stripElementBuffer.numberOfItems = 25;
}

function draw() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Bind the buffer containing both position and color
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
	// Describe how the positions are organized in the vertex array
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexBuffer.positionSize, gl.FLOAT, false, 16, 0);
	// Describe how colors are organized in the vertex array
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexBuffer.colorSize, gl.UNSIGNED_BYTE, true, 16, 12);
	// Draw the triangle
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexBuffer.numberOfItems);

	// Draw the newly added items
	// Draw the hexagon. We draw the hexagon with constant colour, i.e.,
	// a constant colour (1.0, 0.0, 0.0, 1.0) is used for all vertices of the
	// hexagon. To do so, we need to disable the vertex colour attribute
	// (i.e., stop using the data buffer that is assign to variable (
	// aVertexColor)

	gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);

	// Instead, a constant colour is specified when aVertexColor is disabled
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 0.0, 0.0, 1.0);
	// Make vertex buffer "hexagonVertexBuffer" the current buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, hexagonVertexBuffer);
	// Link the current buffer to the attribute "aVertexPosition" in
	// the vertex shader
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, hexagonVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	//Draw line strip
	gl.drawArrays(gl.LINE_STRIP, 0, hexagonVertexBuffer.numberOfItems);

	// draw triangle-strip
	// Again, we draw the triangle strips with a constant colour
	// (1.0, 1.0, 0.0, 1.0)

	gl.bindBuffer(gl.ARRAY_BUFFER, stripVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, stripVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// Specify the constant colour to fill the triangle strip
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 1.0, 1.0, 0.0, 1.0);
	// The triangle strip will be drawn from its vertex index. We first
	// make the index buffer the current buffer by binding it
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, stripElementBuffer);
	gl.drawElements(gl.TRIANGLE_STRIP, stripElementBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
	// Draw border lines of the triangles so that we see the triangles that
	// build up the triangle-strip. But we use a different constant colour for
	// the line
	gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, 0.0, 0.0, 0.0, 1.0);

	// Draw line for the upper strip using index 0-10
	gl.drawArrays(gl.LINE_STRIP, 0, 11);
	// Draw line for the lower strip using index 11-21
	gl.drawArrays(gl.LINE_STRIP, 11, 11);
}

function startup() {
	canvas = document.getElementById('myGLCanvas');
	gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
	setupShaders();
	setupBuffers();
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	draw();
}
