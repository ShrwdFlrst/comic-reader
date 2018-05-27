// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// window.$ = window.jQuery = require('jquery')
const fs = require('fs')
const path = require('path')
const remote = require('electron').remote
const tempDir = remote.getGlobal('sharedObj').tempDir

console.log(tempDir);

document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
}

document.body.ondrop = (ev) => {
    let file = ev.dataTransfer.files[0].path;
    let name = ev.dataTransfer.files[0].name;
    ev.preventDefault()
    let info = fs.statSync(file);
    console.log(info)
    fs.copyFileSync(file, path.join(tempDir, name))
}
//
// $("html").on("dragover", function(event) {
//     event.preventDefault();
//     event.stopPropagation();
//     // console.log('drag over');
// });
//
// $("html").on("dragleave", function(event) {
//     event.preventDefault();
//     event.stopPropagation();
//     // console.log('drag leave');
// });
//
// $("html").on("drop", function(event) {
//     event.preventDefault();
//     event.stopPropagation();
//     console.log(event.dataTransfer.files[0].path)
//     console.log('dropped');
// });