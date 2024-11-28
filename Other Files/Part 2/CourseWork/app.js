var vertexShaderText = [
    'precision mediump float;',
    '',
    'attribute vec3 vertPosition;', //vec 2 vec3 and vec4 represenet tuples, triplets and fourplets. A vector of (num) elements
    'attribute vec3 vertColor;', // Vec 3 as the color is in RGB
    'varying vec3 fragColor;', // this is output from a vertex shader  
    'uniform mat4 mWorld;', // 4x4 matrix
    'uniform mat4 mView;', // Camera
    'uniform mat4 mProj;',
    '',
    'void main()', // Every shader has its main
    '{',
    '   fragColor = vertColor;',
    '   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);', // gl_position is 4 dimensional vector x and y comes from vert position, z is 0.0, last one is always 1.0
    // The position is multiplied by mWorld, this will be rotating teh cube in the 3D space, then multiplying by the view matrix which is where the camera is, then finally we multiply by the projection matrix to get us the points
    '}'
].join('\n');


var fragmentShaderText = [
    'precision mediump float;',
    '',
    'varying vec3 fragColor;',
    'void main()',
    '{',
    '   gl_FragColor = vec4(fragColor, 1.0);',
    '}'
].join('\n');


var degToRadian = deg => (deg * Math.PI / 180)


var initDemo = function () {

    //Step 1 Initialize the WebGL
    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not suppport WebGL');
    }

    //Set a colour for clearing the WebGL context
    //Setting a color of the paint that we are going to use later
    gl.clearColor(0.75, 0.85, 0.8, 1.0);

    // We use this to actually color the page
    // gl.clear();
    //Colour Buffer is stores what colour for the pixel shopuld be
    //Depth Buffer is storing how deep in the screen the pixel is. Circle in fron of the triangle
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Creates a canvas with the colour
    gl.enable(gl.DEPTH_TEST); // To make colours appear outside
    gl.enable(gl.CULL_FACE); // It removes the back of the picture to save the memory
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK); // It removes the back of the picture to save the memory, as it dones't do the math calcualtions for it
    //
    //Step 2 Creating the shaders
    //
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    //first parameter is for the shader we want to use and the second one taking the text
    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);


    //Step 3 Compiling the shaders
    //Checking for compilation errors as it reads the text
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }


    //Step 4 combining the shaders and telling that these are the two program we would like to use together, we do that through creating  a program
    // entire pipeline
    var program = gl.createProgram();
    gl.attachShader(program, fragmentShader);
    gl.attachShader(program, vertexShader);

    //Step 5 link the programs
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR Linknig program!', gl.getProgramInfoLog(program));
        return;
    }
    //It will catch addition issues
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    //
    // Create Buffer ()Triangle example eplaination, we have two points of data and we know that from a vertex data (attribute vec 2 ), in this step we need to create a list of x and y coordinates to define our triangle, after that we need to attach that to our graphic card
    //

    //Counter clock wise order
    // it is on our RAM and CPU
    var boxVertices =
        [ // X, Y, Z           R, G, B
            // Top
            -1.0, 1.0, -1.0, 0.5, 0.5, 0.5,
            -1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
            1.0, 1.0, 1.0, 0.5, 0.5, 0.5,
            1.0, 1.0, -1.0, 0.5, 0.5, 0.5,

            // Left
            -1.0, 1.0, 1.0, 0.75, 0.25, 0.5,
            -1.0, -1.0, 1.0, 0.75, 0.25, 0.5,
            -1.0, -1.0, -1.0, 0.75, 0.25, 0.5,
            -1.0, 1.0, -1.0, 0.75, 0.25, 0.5,

            // Right
            1.0, 1.0, 1.0, 0.25, 0.25, 0.75,
            1.0, -1.0, 1.0, 0.25, 0.25, 0.75,
            1.0, -1.0, -1.0, 0.25, 0.25, 0.75,
            1.0, 1.0, -1.0, 0.25, 0.25, 0.75,

            // Front
            1.0, 1.0, 1.0, 1.0, 0.0, 0.15,
            1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
            -1.0, -1.0, 1.0, 1.0, 0.0, 0.15,
            -1.0, 1.0, 1.0, 1.0, 0.0, 0.15,

            // Back
            1.0, 1.0, -1.0, 0.0, 1.0, 0.15,
            1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
            -1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
            -1.0, 1.0, -1.0, 0.0, 1.0, 0.15,

            // Bottom
            -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
            -1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
            1.0, -1.0, 1.0, 0.5, 0.5, 1.0,
            1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
        ];
    // Index List, which sets of vertices form a triangle
    var boxIndices =
        [	// Top
            0, 1, 2, // uses 0 1 2 from the prvious one 
            0, 2, 3,

            // Left
            5, 4, 6,
            6, 4, 7,

            // Right
            8, 9, 10,
            8, 10, 11,

            // Front
            13, 12, 14,
            15, 14, 12,

            // Back
            16, 17, 18,
            16, 18, 19,

            // Bottom
            21, 20, 22,
            22, 20, 23
        ];

    // Memory on the GPU
    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    // Now to tell the computer that our points are the vertexes x and y tuples, not sepereate numbers like they are seen noww 0.0, 0.5 ...
    // What program are we using, program will specify which vertex shader we are u sing, and then what's the name of attibute we are using
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    // Then we specify the layout of that attribute
    // Its all for the GPU so it knows what to do with the data
    gl.vertexAttribPointer(
        positionAttribLocation, //Attribute location
        3, //Number of elements per attribute vec 2
        gl.FLOAT, // Type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT,//Size of an individual vertex
        0 // Offset from the beggining of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, //Attribute location
        3, //Number of elements per attribute vec 2
        gl.FLOAT, // Type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // To get to the rgb values we need to skip some lines
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //Tell OpenGL state nachgine which program should be active
    gl.useProgram(program);
    //PART 2
    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    //Creating the identity matrix
    glMatrix.mat4.identity(worldMatrix);
    glMatrix.mat4.identity(viewMatrix);
    glMatrix.mat4.identity(projMatrix);
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]); // How the camera sees it
    glMatrix.mat4.perspective(projMatrix, degToRadian(45), canvas.width / canvas.height, 0.1, 1000.0)

    //Send the matrices to the shader
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);


    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);


    //
    // Main render loop
    //

    //Whatever function is here i want to call it whenever the screen is ready normally 1/60
    // lose fouces when it is changed
    var identityMatrix = new Float32Array(16);
    glMatrix.mat4.identity(identityMatrix);
    var angle = 0;
    var loop = function () {
        var angle = performance.now() / 1000 / 6 * 2 * Math.PI; // 1 full rotation every 6 seconds
        glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        glMatrix.mat4.multiply(worldMatrix, xRotationMatrix, yRotationMatrix)
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
        gl.clearColor(0.75, 0.85, 0.8, 1.0)
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

};

