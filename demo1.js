// vertex shader
/*Might look like this in javascript
function vertexShader(a_position, a_textcoord){
  return v_textcoord;}*/
// gl_position sets up where on the rendering surface to draw that vertex
var vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
out vec2 v_texcoord;
void main() {
  gl_Position = mProj * mView * mWorld * a_position;
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

  var image = loadTexture('stone1.png');

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
    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // create a form
  var transformation = document.createElement("form");
  transformation.setAttribute('action',"");
  transformation.setAttribute('value',"Submit");
  document.body.appendChild(transformation);

  var heading = document.createElement('h5'); // Heading of Form
  heading.innerHTML = "Fill in a field to transform the image. Empty fields will be treated as 0.";
  transformation.appendChild(heading);


  // transformation x and y fields
  var x_text = document.createElement("label");
  x_text.innerHTML = "Transform X: ";
  transformation.appendChild(x_text);
  var x = document.createElement('input'); // Create Input Field for Name
  x.setAttribute("type", "text");
  transformation.appendChild(x);

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak);

  var y_text = document.createElement("label");
  y_text.innerHTML = "Transform Y: ";
  transformation.appendChild(y_text);
  var y = document.createElement('input'); // Create Input Field for Name
  y.setAttribute("type", "text");
  transformation.appendChild(y);

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak);


  // rotation degree field
  var degree_text = document.createElement("label");
  degree_text.innerHTML = "Rotation Degrees: ";
  transformation.appendChild(degree_text);
  var rotation = document.createElement('input'); // Create Input Field for Name
  rotation.setAttribute("type", "text");
  transformation.appendChild(rotation);

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak); //0


  // scale scalar fields
  var scalar_x_text = document.createElement("label");
  scalar_x_text.innerHTML = "Scalar X: ";
  transformation.appendChild(scalar_x_text); //1
  var scalar_x = document.createElement('input'); // Create Input Field for Name
  scalar_x.setAttribute("type", "text");
  transformation.appendChild(scalar_x); //2

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak); //3

  var scalar_y_text = document.createElement("label");
  scalar_y_text.innerHTML = "Scalar Y: ";
  transformation.appendChild(scalar_y_text); //4
  var scalar_y = document.createElement('input'); // Create Input Field for Name
  scalar_y.setAttribute("type", "text");
  transformation.appendChild(scalar_y); //5

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak); //6


  // shear factor fields
  var horizontalText = document.createElement("label");
  horizontalText.innerHTML = "Horizontal Shear: ";
  transformation.appendChild(horizontalText); //7
  var horizontal = document.createElement('input'); // Create Input Field for Name
  horizontal.setAttribute("type", "text");
  transformation.appendChild(horizontal); //8

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak);

  var verticalText = document.createElement("label");
  verticalText.innerHTML = "Vertical Shear: ";
  transformation.appendChild(verticalText);
  var vertical = document.createElement('input'); // Create Input Field for Name
  vertical.setAttribute("type", "text");
  transformation.appendChild(vertical);

  var linebreak = document.createElement('br');
  transformation.appendChild(linebreak);
  
  var buttonTransform = document.createElement("button");
  buttonTransform.innerHTML = "Transform";
  transformation.appendChild(buttonTransform);

  buttonTransform.onclick = function(){
    var t = []
    var t_names = ["Transform X","Transform Y","Rotation Degrees","Scalar X", "Scalar Y","Horizontal Shear", "Vertical Shear"];
    // TODO: Check out why for some reason the fields are in the first positions...
    for(i=0; i<7; i++)
    {
      //alert(i + transformation[i].value);
      if (transformation[i].value == "") {
        t.push(0.0); 
      } else if(isNaN(transformation[i].value)) {
          alert(t_names[i] + " Input not valid");
          return;
      } else {
          t.push(parseFloat(transformation[i].value));
      }
    }
    // TODO: requestAnimationForm()
    //canvas.style.transform = "translate(t[0],t[1]) rotate(t[2]) scale(t[3],t[4]) skew(t[5],t[6])";
  }

}

main();