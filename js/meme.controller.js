'use strict'

const TOUCH_EVS = ['touchstart', 'touchmove', 'touchend']

let gElCanvas
let gCtx
let gIsDrag = false
let gStartPos
let gCurrLineIdx

function onInitMeme() {
    gElCanvas = getEl('.main-canvas')
    gCtx = gElCanvas.getContext('2d')
    addListeners()
}

function addListeners() {
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mouseup', onUp)
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchend', onUp)
}

function renderSavedMeme(elImg){
    setMeme(elImg.dataset.i)
    hideSavedMemes()
    showEditor()
    resizeCanvas(elImg)
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
    // elImg.src = 
}

function renderImg(elImg) {
    
    hideSavedMemes()
    setMemeImg(elImg)
    hideGallery()
    showEditor()
    resizeCanvas(elImg)
    gCtx.drawImage(elImg, 0, 0, gElCanvas.width, gElCanvas.height)
}

function renderMeme() {
    const selectedLine = getSelectedLine()
    const elImg = getMeme().selectedImg
    renderImg(elImg)
    renderExistTexts()
    addTextLine(selectedLine.txt, selectedLine.fontSize, selectedLine.fontType, selectedLine.x, selectedLine.y, selectedLine.color, selectedLine.strokeColor)
}

function hideGallery() {
    addClass('hidden', '.img-gallery')
}

function hideSavedMemes(){
    removeClass('flex', '.saved-memes')
    addClass('hidden' , '.saved-memes')
}

function showEditor() {
    addClass('flex', '.meme-editor')
    removeClass('hidden', '.meme-editor')
}

function onSetMeme(idx){
    setMeme(idx)    
}

function onAddText(txt) {
    
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
    gCtx.drawImage(getMeme().selectedImg, 0, 0, gElCanvas.width, gElCanvas.height)

    renderExistTexts()

    if (isLineExist()) {
        var currLine = getSelectedLine()
        addTextLine(txt, currLine.fontSize, currLine.fontType, currLine.x, currLine.y, currLine.color, currLine.strokeColor)
        setLine(txt, currLine.x, currLine.y)
    }
    else {
        var { x, y } = getTxtLocation()
        addTextLine(txt, undefined, undefined, x, y) //change the text
        setLine(txt, x, y)
    }
}

function getTxtLocation() {
    const lineIdx = getSelectedLineIdx()

    const x = gElCanvas.width / 2
    let y
    if (lineIdx === 0) y = 45 //initial font size = 45
    else if (lineIdx === 1) y = gElCanvas.height - 15
    else y = gElCanvas.width / 2

    return { x, y }
}

function renderExistTexts() { //render all texts that already enter
    getMeme().lines.forEach((line, idx) => {
        if (getSelectedLineIdx() !== idx) addTextLine(line.txt, line.fontSize, line.fontType, line.x, line.y, line.color, line.strokeColor)
    })
}

function addTextLine(txt, fontSize = 45, fontType = 'Comic Sans MS', x, y, color = "white", strokeColor = "black") {
    gCtx.font = fontSize + 'px ' + fontType; ///Impact font family
    gCtx.fillStyle = color
    gCtx.textAlign = "center"
    gCtx.strokeStyle = strokeColor
    gCtx.lineWidth = 6
    gCtx.strokeText(txt, x, y)
    gCtx.fillText(txt, x, y)
}

function resizeCanvas(elImg) { 
    const elContainer = getEl('.meme-editor-layout')
    gElCanvas.width = elContainer.offsetWidth
    const IH = elImg.height
    const IW = elImg.width
    const CW = gElCanvas.width
    gElCanvas.height = IH * CW / IW //CH 

    console.log('IH:', IH)
    console.log('IW:', IW)
}

function onDown(ev) {
    const pos = getEvPos(ev)
    gCurrLineIdx = getSelectedLineIdx()

    if (!isTextClicked(pos)) return
    setSelectedIdx(gOnDownLineIdx)
    getEl('.text-input').value = getSelectedLine().txt
    onSetColorValues()
    setTextDrag(true)

    gStartPos = pos
    document.body.style.cursor = 'grabbing'
}

function getEvPos(ev) {
    let pos = { x: ev.offsetX, y: ev.offsetY }

    if (TOUCH_EVS.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

function setTextDrag(isDrag) {
    gIsDrag = isDrag
}

function onUp() {
    setTextDrag(false)
    document.body.style.cursor = 'grab'
    gCurrLineIdx = getSelectedLineIdx()
}

function onMove(ev) {

    const pos = getEvPos(ev)
    if (isTextClicked(pos) && !gIsDrag) {
        document.body.style.cursor = 'grab'
        // onSetSquareAround()
    }
    else if (isTextClicked(pos) && gIsDrag) document.body.style.cursor = 'grabbing'
    else document.body.style.cursor = 'default'
    if (!gIsDrag) return

    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y

    moveText(dx, dy)
    renderMeme()
    gStartPos = pos
}

// function onSetSquareAround() {
//     let line = getSelectedLine()
//     gCtx.beginPath();
//     gCtx.rect(line.leftTop.x, line.leftTop.y, line.width, line.fontSize);
//     gCtx.stroke();
// }

function downloadImg(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg') // image/jpeg the default format
    elLink.href = imgContent
}

function onSetTextColor(color) {
    setTextColor(color)
    renderMeme()
}

function onSetStrokeColor(color) {
    setStrokeColor(color)
    renderMeme()
}

function onSetFontBigger(isBigger) {
    const deltaPx = isBigger ? 2 : -2
    setFontBigger(deltaPx)
    renderMeme()
}

function onDeleteLine() {
    deleteLine()
    getEl('.text-input').value = getSelectedLine().txt
    onSetColorValues()
    renderMeme()
}

function onAddLine() {
    createLine('', 0)
    setSelectedIdx(getMeme().lines.length - 1)
    getEl('.text-input').value = ''
    onSetColorValues()
}

function onRowUp(isUp) {
    var currLine = getSelectedLineIdx()
    if (isUp && currLine - 1 < 0 || !isUp && currLine + 1 > getMeme().lines.length - 1) return
    if (isUp) setSelectedIdx(currLine - 1)
    if (!isUp) setSelectedIdx(currLine + 1)

    getEl('.text-input').value = getSelectedLine().txt
    onSetColorValues()
}

function onSetFontType(ElfontType){
    if (!ElfontType.value) return
    setFontType(ElfontType.value)
    renderMeme()
    ElfontType.value = ''
}

function onUploadImg() {
    const imgDataUrl = gElCanvas.toDataURL('image/jpeg')
    function onSuccess(uploadedImgUrl) {
        const url = encodeURIComponent(uploadedImgUrl)
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${url}`)
    }
    doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
    const formData = new FormData()
    formData.append('img', imgDataUrl)
    const XHR = new XMLHttpRequest()

    XHR.onreadystatechange = () => {
        if (XHR.readyState !== XMLHttpRequest.DONE) return
        if (XHR.status !== 200) return console.error('Error uploading image')
        const { responseText: url } = XHR
        console.log('Got back live url:', url)
        onSuccess(url)
    }
    XHR.onerror = (req, ev) => {
        console.error('Error connecting to server with request:', req, '\nGot response data:', ev)
    }
    XHR.open('POST', '//ca-upload.com/here/upload.php')
    XHR.send(formData)
}

function onSetColorValues(){
    getEl('.txt-color').value = getSelectedLine().color + ''
    getEl('.stroke-color').value = getSelectedLine().strokeColor + ''
}

function onSaveMeme(){
    saveMeme(gElCanvas.toDataURL())
    onGetSavedMemes()
}

function onGetSavedMemes() {
    hideGallery()
    removeClass('flex', '.meme-editor')
    addClass('hidden', '.meme-editor')
    addClass('flex', '.saved-memes')
    removeClass('hidden', '.saved-memes')

    let dataURLs = loadFromStorage(STORAGE_URL_KEY)
    if(!dataURLs) return
    
    getEl('.saved-memes').innerHTML = ''
    dataURLs.forEach((dataURL, idx) => {
        getEl('.saved-memes').innerHTML += `<img src="${dataURL}" class="img${idx}" data-i="${idx}" onclick="renderSavedMeme(this)"> </img>`
    })
}