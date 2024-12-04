// ==UserScript==
// @name         Pooiod7 Extension Gallery (for PenguinMod)
// @namespace    https://p7scratchextensions.pages.dev/
// @version      2024-12-04
// @description  Adds the extension gallery of pooiod7 to PenguinMod.
// @author       pooiod7
// @match        https://studio.penguinmod.com/editor.html*
// @icon         https://p7scratchextensions.pages.dev/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function checkAndInsertExtensionGallery() {
        const targetSpan = Array.from(document.querySelectorAll('span'))
            .find(span => span.textContent.trim() === 'PenguinMod Extra Extensions');

        if (targetSpan && !document.querySelector('#p7extensionslist')) {
            const parentElement = targetSpan.closest('span').parentElement.parentElement;

            const newHTML = `
<div id="p7extensionslist" class="library-item_library-item_1DcMO library-item_featured-item_3V2-t library-item_library-item-extension_3xus9" onclick="window.open('https://p7scratchextensions.pages.dev')">
  <div class="library-item_featured-image-container_1KIHG">
    <img class="library-item_featured-image_2gwZ6" loading="lazy" draggable="false" src="https://p7scratchextensions.pages.dev/extras/images/P7ExtGallaryCover.png">
  </div>
  <div class="library-item_featured-extension-text_22A1k library-item_featured-text_2KFel">
    <span class="library-item_library-item-name_2qMXu"><span>Pooiod7's extensions</span></span><br>
    <span class="library-item_featured-description_MjIJw"><span>A large array of extensions created by pooiod7</span></span>
  </div>
</div>
`;

            parentElement.insertAdjacentHTML('afterend', newHTML);
        }
    }

    setInterval(checkAndInsertExtensionGallery, 1000);

})();
