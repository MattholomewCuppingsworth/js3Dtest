
var loadIdentity = function() {
	mvMatrix = Matrix.I(4);
}

var multMatrix = function(m) {
	mvMatrix = mvMatrix.x(m);
}

var mvTranslate = function(v) {
	multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

var setMatrixUniforms = function() {
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}
