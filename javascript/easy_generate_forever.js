onUiLoaded(() => {
  // --- javascript/contextMenu.js
  const generateOnRepeat = function (genbuttonid, interruptbuttonid) {
    let genbutton = gradioApp().querySelector(genbuttonid);
    let interruptbutton = gradioApp().querySelector(interruptbuttonid);
    if (!interruptbutton.offsetParent) {
      genbutton.click();
    }
    clearInterval(window.generateOnRepeatInterval)
    window.generateOnRepeatInterval = setInterval(function () {
      if (!interruptbutton.offsetParent) {
        genbutton.click();
      }
    },500)
  }
  const cancelGenerateForever = function () {
    clearInterval(window.generateOnRepeatInterval)
  }
  // ---

  const buildButtons = () => {
    const generateButton = gradioApp().getElementById('txt2img_generate')

    const generateForeverButton = generateButton.cloneNode()
    generateForeverButton.innerText = 'Generate Forever'
    generateForeverButton.id = ''
    generateForeverButton.classList.remove('lg', 'primary')
    generateForeverButton.classList.add('sm', 'secondary')

    const cancelGenerateForeverButton = generateForeverButton.cloneNode()
    cancelGenerateForeverButton.innerText = 'Cancel Forever'

    return [generateForeverButton, cancelGenerateForeverButton]
  }

  const setIndicatorLabel = (indicator, alert = false) => {
    if (indicator.innerHTML === '🚫' && alert) return

    indicator.innerHTML = !alert ? '♾️' : '🚫'
  }

  ['txt2img', 'img2img'].forEach((tab) => {
    const [generateForeverButton, cancelGenerateForeverButton] = buildButtons()

    const indicator = document.createElement('span')
    indicator.classList.add('indicator')
    setIndicatorLabel(indicator)

    const seedInput = gradioApp().getElementById(`${tab}_seed`).querySelector('input')
    // FIXME: no dispatch event when `Send to txt2img`
    setInterval(() => { setIndicatorLabel(indicator, seedInput.value !== '-1') }, 1000)

    //
    generateForeverButton.addEventListener('click', () => {
      generateOnRepeat(`#${tab}_generate`, `#${tab}_interrupt`)
      indicator.classList.add('forever')
    })
    cancelGenerateForeverButton.addEventListener('click', () => {
      cancelGenerateForever()
      indicator.classList.remove('forever')
    })

    //
    const buttons = document.createElement('div')
    buttons.classList.add('easy_generate_forever_container', 'buttons')
    buttons.appendChild(generateForeverButton)
    buttons.appendChild(cancelGenerateForeverButton)

    const container = document.createElement('div')
    container.classList.add('easy_generate_forever_container')
    container.appendChild(indicator)
    container.appendChild(buttons)

    gradioApp().getElementById(`${tab}_generate_box`).after(container)
  })

  // === Keyboard Shortcut ===
  let isForeverActive = false; // Status flag 

  document.addEventListener('keydown', (e) => {

    // Toggle with Ctrl + Shift + G
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
      e.preventDefault();

      // target tab
      const tab = 'txt2img'; // or img2img

      const genBtn = `#${tab}_generate`;
      const interruptBtn = `#${tab}_interrupt`;
      const indicator = gradioApp().querySelector(`#${tab}_generate_box`)
        ?.nextElementSibling?.querySelector('.indicator');

      if (!isForeverActive) {
        // ON: Start
        generateOnRepeat(genBtn, interruptBtn);
        indicator?.classList.add('forever');
        console.log('[Generate Forever] ON');
      } else {
        // OFF: Stop
        cancelGenerateForever();
        indicator?.classList.remove('forever');
        console.log('[Generate Forever] OFF');
      }

      isForeverActive = !isForeverActive;
    }
  });
})
