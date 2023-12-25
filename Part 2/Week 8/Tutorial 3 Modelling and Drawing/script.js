/** @format */

//STEP 1 Define global variables here
var gl;
var canvas;
var shaderProgram;
var vertexBuffer;
//This function is the entry point of this webgl application
//It is the first functioned to be called when html doc is loaded into
//the browser. See html code at the end
function startup() {
	//retrieve html canvas
	canvas = document.getElementById('myGLCanvas');
	//gl = createGLContext(canvas);
	//create webgl context. Here, the debugging context is created
	//by calling a function in library "webgl-debug.js"
	gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
	setupShaders();
	setupBuffers();
	//Set the background – set the color to clear the canvas with
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	draw();
}

//Create WebGL context. Recall that we have use getContext("2D")
//to create a 2D context for drawing 2D graphics
function createGLContext(canvas) {
	var names = ['webgl', 'experimental-webgl'];
	var context = null;
	for (var i = 0; i < names.length; i++) {
		try {
			context = canvas.getContext(names[i]);
		} catch (e) {}
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
	// add code here
	//Create vertex and fragment shaders
	vertexShader = loadShaderFromDOM('shader-vs');
	fragmentShader = loadShaderFromDOM('shader-fs');
	//create a webgl program object
	shaderProgram = gl.createProgram();
	//load the compiled shaders(compilation has been done in loadShaderFromDOM()
	// function) to the program object
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	//link shaders and check linking status
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Failed to setup shaders');
	}
	//activate the program
	gl.useProgram(shaderProgram);
	/*add a property (named as vertexPositionAttttribute)to the shader program 
    object. The property is the attribute in the vertex shader, which has been
    loaded to the program object. Function getAttribLocation() finds the pointer to 
    this attribute. We need to access this property in other part of the program*/
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
}

//Buffers are places for data. All data, e.g., vertex coordinates, //texture coordinates, indices, colours must be stored in their
//buffers. Here, the buffer is for the vertex coordinates of a triangle

function setupBuffers() {
	//A buffer object is first created by calling gl.createBuffer()
	vertexBuffer = gl.createBuffer();
	//Then bind the buffer to gl.ARRAY_BUFFER, which is the WebGL built-in //buffer where the vertex shader will fetch data from
	//Then created buffer is initialised to be type of gl.ARRAY_BUFFER by
	// calling bindBuffer(). There are two type WebGL buffers. The other
	//is gl.ELEMENT_ARRAY_BUFFER.
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	//Actual coordinates for the vertices
	var triangleVertices = [0.0, 0.5, 0.0, -0.5, -0.5, 0.0, 0.5, -0.5, 0.0];

	//Load the vertex data to the buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
	//Add properties to vertexBuffer object
	vertexBuffer.itemSize = 3; //3 coordinates of each vertex
	vertexBuffer.numberOfItems = 3; //3 vertices in all in this buffer
}

function draw() {
	/*setup a viewport that is the same as the canvas using function 
        viewport(int x, int y, sizei w, sizei h) where x and y give the x and 
        y window coordinates of the viewport’s lower left corner and w and h 
        give the viewport’s width and height.*/
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	/*fill the canvas with solid colour. Default is black
        If other colour is desirable using function gl.clearColor (r,g,b,a) */
	gl.clear(gl.COLOR_BUFFER_BIT); //COLOR_BUFFER_BIT flag that enables
	//the view buffer for colouring
	/*Link the pointer to "aVertexPosition“ (Still remember it?) to the 
        currently bound gl.ARRAY_BUFFER. See function setupBuffers() */
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	//Draw the triangle
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}
