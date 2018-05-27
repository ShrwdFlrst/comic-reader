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
let preloadCount = 4

document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
}

document.body.addEventListener('drop', handleDrop)

$(document).keydown((e) => {
    switch(e.which) {
        case 37:
            prevPage()
            break;

        case 39:
            nextPage()
            break;

        case 83:
            toggleViewPages()
            break;

        default: return;
    }
    e.preventDefault();
});

function handleDrop(ev) {
    fileDrop.text('Loading ' + ev.dataTransfer.files[0].name + '...')
    document.body.removeEventListener('drop', handleDrop)

    try {
        let file = copyToTemp(ev.dataTransfer.files[0].path)
        ev.preventDefault()
        let dirName = path.basename(file, path.extname(file))
        bookPath = path.join(getTempDir(), dirName)
        let filesExtractedCount = 0

        function onEntry(entry, file) {
            filesExtractedCount++
            fileDrop.text('Loading ' + Math.round((filesExtractedCount / file.entryCount) * 100) + '%')
        }

        extract(file, {dir: bookPath, onEntry: onEntry}, (err) => {
            pages = fs.readdirSync(bookPath)

            if (pages.length === 0) {
                fileDrop.text('Oops, something went wrong. Try again or use a different file.')
                document.body.addEventListener('drop', handleDrop)
                return
            }

            displayCurrentPage()
            fileDrop.hide()
        })
    } catch (err) {
        fileDrop.text('Oops, something went wrong. Try again or use a different file.')
        document.body.addEventListener('drop', handleDrop)
        console.log(err)
    }
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
    pagesContainer.css('display', 'flex')
    pagesContainer.show()
    pageLeft.css('background-image', 'url(' + path.join(bookPath, pages[currentPage]) + ')');
    pageLeft.text(currentPage + 1 + '/' + pages.length)

    if (pages.length > currentPage + 1) {
        pageRight.css('background-image', 'url(' + path.join(bookPath, pages[currentPage + 1]) + ')');
    } else {
        pageRight.css('background-image', '')
    }
    preload()
}

function preload() {
    for (var i = 1; i <= preloadCount; i++) {
        if (pages.length > currentPage + i) {
            $("<img />").attr("src", path.join(bookPath, pages[currentPage + i]));
        }
        if (currentPage - i >= 0) {
            $("<img />").attr("src", path.join(bookPath, pages[currentPage - i]));
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

function toggleViewPages() {
    if (advanceBy === 2) {
        advanceBy = 1
        pageLeft.removeClass('left')
        pageLeft.addClass('single')
        pageRight.hide()
    } else {
        // Make sure odd pages are always on the left
        if (currentPage > 0 && currentPage % 2 != 0) {
            prevPage()
        }

        advanceBy = 2
        pageLeft.addClass('left')
        pageLeft.removeClass('single')
        pageRight.show()
    }
}