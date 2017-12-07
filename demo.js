// vertex shader
/*Might look like this in javascript
function vertexShader(a_position, a_textcoord){
  return v_textcoord;}*/
// gl_position sets up where on the rendering surface to draw that vertex
var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

// fragment shader
// takes in v_texcoord from vertexShader
// outputs ...
var fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

var identityMatrix = [
    1.0,0.0,0.0,
    0.0,1.0,0.0,
    0.0,0.0,1.0,
];

var transformationMatrix = identityMatrix;

 function transform(type)
  {
    switch (type){
      // Translations
      case 'TXL':
        transformationMatrix = [
            1.0,0.0,-0.1,
            0.0,1.0,0.0
        ];
        break;
      case 'TXR':
        transformationMatrix = [
            1.0,0.0,0.1,
            0.0,1.0,0.0,
        ];
        break;
      case 'TYU':
        transformationMatrix = [
            1.0,0.0,0.0,
            0.0,1.0,0.1,
        ];
        break;
      case 'TYD':
        transformationMatrix = [
            1.0,0.0,0.0,
            0.0,1.0,-0.1,
        ];
        break;
      // rotation about the z-axis
      case 'RL':
        transformationMatrix = [
          Math.cos(Math.PI/12),-Math.sin(Math.PI/12),0.0,
          Math.sin(Math.PI/12),Math.cos(Math.PI/12),0.0,
        ];
        break;
      case 'RR':
        transformationMatrix = [
          Math.cos(-Math.PI/12),Math.sin(Math.PI/12),0.0,
          Math.sin(-Math.PI/12),Math.cos(-Math.PI/12),0.0,
        ];
        break;
      // scale
      case 'SX+':
        transformationMatrix = [
            2.0,0.0,0.0,
            0.0,1.0,0.0,
        ];
        break;
      case 'SX-':
        transformationMatrix = [
            0.5,0.0,0.0,
            0.0,1.0,0.0,
        ];
        break;
      case 'SY+':
        transformationMatrix = [
            1.0,0.0,0.0,
            0.0,2.0,0.0,
        ];
        break;
      case 'SY-':
        transformationMatrix = [
            1.0,0.0,0.0,
            0.0,0.5,0.0,
        ];
        break;
      // shear
      case 'SXR':
        transformationMatrix = [
            1.0,0.1,0.0,
            0.0,1.0,0.0
        ];
        break;
      case 'SYU':
        transformationMatrix = [
            1.0,0.0,0.0,
            0.1,1.0,0.0,
        ];
        break;
      case 'SYD':
        transformationMatrix = [
            1.0,0.0,0.0,
            -0.1,1.0,0.0,
        ];
        break;
      case 'SXL':
        transformationMatrix = [
            1.0,-0.1,0.0,
            0.0,1.0,0.0,
        ];
        break;
    }
  }

function loadShader(gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);

  gl.compileShader(shader);

  return shader;
}

function loadProgram(gl) {
  var program = gl.createProgram();

  var shader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, shader);

  shader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  gl.attachShader(program, shader);

  gl.linkProgram(program);

  return program;
}

function main() {

  // get the canvas
  var canvas = document.getElementById("canvas");
  // interface provides the OpenGL ES 3.0 rendering context for the
  // drawing surface of an HTML <canvas> element.
  var gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("Your browser does not support WebGL2");
    return;
  }

  // creates shaders and program is the entire graphics pipeline???
  var program = loadProgram(gl);

  // Create all the information that the graphics card will be using
  // handle to attributes
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  var textureLocation = gl.getUniformLocation(program, "u_texture");

  var vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  // where the cube should be drawn based off of the six visible points
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  // chunk of memory on CPU for Graphics Card
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // enable the attribute for use
  gl.enableVertexAttribArray(positionLocation);

  // specifies the layout of the attribute
  // attribute location, # elements per attribute, type of elements, normalized, size of vertex, offset
  gl.vertexAttribPointer(
      positionLocation, 2, gl.FLOAT, false, 0, 0);

  var texcoords = [ 
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texcoordLocation);

  gl.vertexAttribPointer(
      texcoordLocation, 2, gl.FLOAT, true, 0, 0);

  function loadTexture(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    
    var img = new Image();
    img.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    img.src = url;

    return tex;
  }

  var image = loadTexture('crate.png');

  function draw() {
    // makes sure that gl knows where to paint to
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0); // set up the color to paint with
    // paints based on what is stored in the buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniform1i(textureLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }

  function render(time) {
    // transform the positions here because we have a new transformation matrix
    if(transformationMatrix.length != 9)
    { 
      // create a place to store the new positions
      var transformedPositions = []
      // transform the positions matrix based on the transformationMatrix and store them
      transformedPositions.push(positions[0]*transformationMatrix[0]+positions[1]*transformationMatrix[1]+transformationMatrix[2]);
      transformedPositions.push(positions[0]*transformationMatrix[3]+positions[1]*transformationMatrix[4]+transformationMatrix[5]);
      transformedPositions.push(positions[2]*transformationMatrix[0]+positions[3]*transformationMatrix[1]+transformationMatrix[2]);
      transformedPositions.push(positions[2]*transformationMatrix[3]+positions[3]*transformationMatrix[4]+transformationMatrix[5]);
      transformedPositions.push(positions[4]*transformationMatrix[0]+positions[5]*transformationMatrix[1]+transformationMatrix[2]);
      transformedPositions.push(positions[4]*transformationMatrix[3]+positions[5]*transformationMatrix[4]+transformationMatrix[5]);
      transformedPositions.push(positions[6]*transformationMatrix[0]+positions[7]*transformationMatrix[1]+transformationMatrix[2]);
      transformedPositions.push(positions[6]*transformationMatrix[3]+positions[7]*transformationMatrix[4]+transformationMatrix[5]);
      transformedPositions.push(positions[8]*transformationMatrix[0]+positions[9]*transformationMatrix[1]+transformationMatrix[2]);
      transformedPositions.push(positions[8]*transformationMatrix[3]+positions[9]*transformationMatrix[4]+transformationMatrix[5]);
      transformedPositions.push(positions[10]*transformationMatrix[0]+positions[11]*transformationMatrix[1]+transformationMatrix[2]);
      transformedPositions.push(positions[10]*transformationMatrix[3]+positions[11]*transformationMatrix[4]+transformationMatrix[5]);
      // positions should now be set to transformedPositions so that the new positions are stored
      positions = transformedPositions;

      // Keeps this from being rendered until another button has been pushed
      transformationMatrix = identityMatrix;

      // AND then save the transformation to the positionBuffer so they can be accessed by the draw method
      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(
        positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

main();
