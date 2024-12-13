
if (window.location.hostname === 'studio.penguinmod.com') {

    function checkAndInsertExtensionGallery() {
        const targetSpan = Array.from(document.querySelectorAll('span'))
        .find(span => span.textContent.trim() === 'PenguinMod Extra Extensions');

        if (targetSpan && !document.querySelector('#p7extensionslist')) {
            const parentElement = targetSpan.closest('span').parentElement.parentElement;

            const newHTML = `
<div id="p7extensionslist" class="library-item_library-item_1DcMO library-item_featured-item_3V2-t library-item_library-item-extension_3xus9" onclick="window.open('https://p7extensions.pages.dev/')">
  <div class="library-item_featured-image-container_1KIHG">
    <img class="library-item_featured-image_2gwZ6" loading="lazy" draggable="false" src="https://p7extensions.pages.dev/extras/images/P7ExtGalleryCover.png">
  </div>
  <div class="library-item_featured-extension-text_22A1k library-item_featured-text_2KFel">
    <span class="library-item_library-item-name_2qMXu"><span>Pooiod7's extensions</span></span><br>
    <span class="library-item_featured-description_MjIJw"><span>Explore a large collection of Scratch extensions made by Pooiod7.</span></span>
  </div>
</div>
`;

            parentElement.insertAdjacentHTML('afterend', newHTML);
        }
    }

    setInterval(checkAndInsertExtensionGallery, 1000);

    let checks = 0;
    let clicks = 0;

    let interval = setInterval(() => {
        if (checks >= 100) {
            clearInterval(interval);
            return;
        }

        let targetElement = document.querySelector('p.url_url_3Y61f');
        if (targetElement && (targetElement.textContent.includes('https://p7scratchextensions.pages.dev/') || targetElement.textContent.includes('https://p7extensions.pages.dev/'))) {
            let button = document.querySelector('button.security-manager-modal_allow-button_3tcXk');
            if (button) {
                if (button.disabled) button.disabled = false;
                button.click();
                clicks++;

                if (!document.body.contains(targetElement) || clicks >= 10) {
                    clearInterval(interval);
                }
            }
        }
        checks++;
    }, 1000);
}
