"use strict";
/*VECTOR*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*/
var vertexShaderSource = /*glsl*/`#version 300 es
in vec2 a_position;
in vec2 a_texCoord;

uniform vec2 u_resolution;

out vec2 v_texCoord;

void main() {

  // convert the position from pixels to clipspace
  vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;

  // flip y
  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
}
`;
/*FRAGMENT*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*/
var fragmentShaderSource = /*glsl*/`#version 300 es
precision highp float;

uniform vec2 u_resolution;

// our texture
uniform sampler2D u_image;

uniform float zoom_level;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {

    float pi = 3.14;

    // Calculate the radial distance from the center
    float r = length(v_texCoord);

    // If the radial distance is less than 1.0, we are inside the unit circle
    if(r < 1.0)
    {
        // Calculate the angle of the current pixel from the center
        float theta = atan(v_texCoord.x, v_texCoord.y);

        // float s = 0.0001;
        // // s oscillating between 0 and 10
        // if(sin(time) <= -1.0){
        //   s = 0.0001;
        // }else{
        //   s = (sin(time) + 1.0) * 10.0;
        // }

        // Modify the radial distance
        float fisheyeR = (exp(r * log(1.0 + zoom_level * pi) / 1.0) - 1.0) / zoom_level / pi;
        
        // Convert the polar coordinates back to Cartesian coordinates
        vec2 fisheyeUV = vec2(sin(theta) * fisheyeR, cos(theta) * fisheyeR) * 0.5 + 0.5;
        
        // Sample the original image at the calculated coordinates and set the output color
        outColor = texture(u_image, fisheyeUV);
    }
    else
    {
        // If we are outside the unit circle, set the output color to clear
        outColor = vec4(0.0);
    }
}
`;
/*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*//*glsl*/
var image = new Image();
image.src = "./valentine.jpg";  // MUST BE SAME DOMAIN!!!
image.onload = function () {
  render(image);
};
window.onresize = function () {
  render(image);
}

function render(image) {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var imageLocation = gl.getUniformLocation(program, "u_image");
  const zoomLevelLocation = gl.getUniformLocation(program, "zoom_level");

  // Create a vertex array object (attribute state)
  var vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Create a buffer and put a single pixel space rectangle in
  // it (2 triangles)
  var positionBuffer = gl.createBuffer();

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  // provide texture coordinates for the rectangle.
  var texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    // 0.0, 0.0,
    // 1.0, 0.0,
    // 0.0, 1.0,
    // 0.0, 1.0,
    // 1.0, 0.0,
    // 1.0, 1.0,

    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    -1.0, 1.0,
    1.0, -1.0,
    1.0, 1.0,
  ]), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    texCoordAttributeLocation, size, type, normalize, stride, offset);

  // Create a texture.
  var texture = gl.createTexture();

  // make unit 0 the active texture uint
  // (ie, the unit all other texture commands will affect
  gl.activeTexture(gl.TEXTURE0 + 0);

  // Bind it to texture unit 0' 2D bind point
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat at the edges
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  var mipLevel = 0;               // the largest mip
  var internalFormat = gl.RGBA;   // format we want in the texture
  var srcFormat = gl.RGBA;        // format of data we are supplying
  var srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
  gl.texImage2D(gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    image);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Pass in the canvas resolution so we can convert from
  // pixels to clipspace in the shader
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  // Tell the shader to get the texture from texture unit 0
  gl.uniform1i(imageLocation, 0);

  // Bind the position buffer so gl.bufferData that will be called
  // in setRectangle puts data in the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, image.width, image.height);

  let primitiveType = gl.TRIANGLES;
  offset = 0;
  let count = 6;
  let zoom_level = 0.01;



  gl.useProgram(program);
  gl.uniform1f(zoomLevelLocation, zoom_level);
  gl.drawArrays(primitiveType, offset, count);

  canvas.addEventListener('wheel', zoom, { passive: false });

  function zoom(event) {
    event.preventDefault();
    zoom_level += event.deltaY * -0.01;
  
    // Restrict scale
    zoom_level = Math.min(Math.max(0.001, zoom_level), 40.0);
  
    gl.useProgram(program);
    gl.uniform1f(zoomLevelLocation, zoom_level);  // zoom_level 0.001 or higher
    gl.drawArrays(primitiveType, offset, count);
  }

  addEventListener("resize", (event) => {});
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}
