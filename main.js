// https://www.youtube.com/watch?v=LtFujAtKM5I&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF
// https://github.com/airbnb/javascript#modules--use-them
// http://usejsdoc.org/tags-param.html

import App from './app.js'
import DefaultShader from './shaders/default_shader.js'

window.addEventListener("load", function() {
    let app = new App("glcanvas");
    app.setSize(500, 500);
    app.clear();
    app.loadProgram(DefaultShader.vert(), DefaultShader.frag(), true);
    app.initDataBuffers();
    app.draw();
});
