var gl;

var start = function() {
	var canvas = document.getElementById('glCanvas');

	gl = initWebGL(canvas);

	if(gl) {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	}
}

var initWebGL = function(canvas) {
	gl = null;

	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch (e) {}

	if(!gl) {
		alert("Unable to initialize webGL.");
		gl = null;
	}
	return gl;
}