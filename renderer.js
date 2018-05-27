window.$ = window.jQuery = require('jquery')
const fs = require('fs')
const path = require('path')
const remote = require('electron').remote
const extract = require('extract-zip')

const fileDrop = $('.file-drop')
const pageLeft = $('.page.left')
const pageRight = $('.page.right')
const pagesContainer = $('.pages')
let pages
let bookPath
let currentPage = 0
let advanceBy = 2

document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
}

document.body.ondrop = (ev) => {
    let file = copyToTemp(ev.dataTransfer.files[0].path)
    fileDrop.hide()
    ev.preventDefault()
    alert(file)
    let dirName = path.basename(file, path.extname(file))
    bookPath = path.join(getTempDir(), dirName)

    extract(file, {dir: bookPath}, (err) => {
        pages = fs.readdirSync(bookPath)
        displayCurrentPage()
    })

}

pageLeft.on('click', (e) => {
    prevPage()
})

pageRight.on('click', (e) => {
    nextPage()
})

function nextPage() {
    if (currentPage >= pages.length - advanceBy) {
        return
    }

    currentPage += advanceBy
    displayCurrentPage()
}

function prevPage() {
    if (currentPage === 0) {
        return
    }

    currentPage -= advanceBy
    displayCurrentPage()
}

function displayCurrentPage() {
    pagesContainer.show()
    pageLeft.css('background-image', 'url(' + path.join(bookPath, pages[currentPage]) + ')');

    if (pages.length > currentPage + 1) {
        pageRight.css('background-image', 'url(' + path.join(bookPath, pages[currentPage + 1]) + ')');
    }
    preload()
}

function preload() {
    const preloadCount = 2

    for (var i = 1; i <= preloadCount; i++) {
        if (pages.length > currentPage + i) {
            $("<img />").attr("src", path.join(bookPath, pages[currentPage + i]));
        }
    }
}

function getTempDir() {
    return remote.getGlobal('sharedObj').tempDir
}

function copyToTemp(source) {
    let name = path.basename(source)
    let tempDir = getTempDir()
    let destination = path.join(tempDir, name)

    fs.copyFileSync(source, destination)

    return destination
}
