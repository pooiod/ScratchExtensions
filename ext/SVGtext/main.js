(function(Scratch) {
    'use strict';
  
    if (!Scratch.extensions.unsandboxed) {
        throw new Error('This extension must run unsandboxed');
    }

    window.addEventListener('message', (event) => {
        const receivedMessage = event.data;
    
        if (receivedMessage && receivedMessage.startsWith("data:image/svg+xml;charset=utf-8,")) {
            addImage("Text import", receivedMessage);
            document.body.removeChild(document.getElementById("svgtextoverlay"));
        }
    });

    function addImage(name, url) {
        fetch(url)
            .then((r) => r.arrayBuffer())
            .then((arrayBuffer) => {
                const storage = vm.runtime.storage;
                const asset = new storage.Asset(
                    storage.AssetType.ImageVector,
                    null,
                    storage.DataFormat.SVG,
                    new Uint8Array(arrayBuffer),
                    true
                );
                const newCostumeObject = {
                    md5: asset.assetId + '.' + asset.dataFormat,
                    asset: asset,
                    name: name
                };
                vm.addCostume(newCostumeObject.md5, newCostumeObject);
            });
    }

    function addImageButton(image, callback) {
        const checkInterval = 1000;

        const generateRandomId = () => 'btn-' + Math.random().toString(36).substr(2, 9);

        const addButton = () => {
            const target = document.querySelector('#react-tabs-3 > div > div.selector_wrapper_8_BHs.box_box_2jjDp > div.selector_new-buttons_2qHDd.box_box_2jjDp > div > div.action-menu_more-buttons-outer_3J9yZ > div');

            if (target) {
                const newDiv = document.createElement('div');
                const button = document.createElement('button');
                const randomId = generateRandomId();
                
                button.id = randomId;
                button.className = 'action-menu_button_1qbot action-menu_more-button_1fMGZ';
                button.innerHTML = `<img class="action-menu_more-icon_TJUQ7" draggable="false" src="${image}">`;

                button.addEventListener('click', callback);

                newDiv.appendChild(button);
                target.appendChild(newDiv);
            }
        };

        const checkAndAddButton = () => {
            setInterval(() => {
                const target = document.querySelector('#react-tabs-3 > div > div.selector_wrapper_8_BHs.box_box_2jjDp > div.selector_new-buttons_2qHDd.box_box_2jjDp > div > div.action-menu_more-buttons-outer_3J9yZ > div');
                if (target) {
                    const existingButtons = target.querySelectorAll('button.action-menu_button_1qbot');
                    const buttonExists = Array.from(existingButtons).some(button => button.innerHTML.includes(image));
                    if (!buttonExists) {
                        addButton();
                    }
                }
            }, checkInterval);
        };

        checkAndAddButton();
    };

    addImageButton(
        '//p7scratchextensions.pages.dev//extras/images/icons/AddTextIcon.svg',
        async () => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            overlay.style.zIndex = '9999';
            overlay.id = "svgtextoverlay";
            
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.top = '50%';
            wrapper.style.left = '50%';
            wrapper.style.transform = 'translate(-50%, -50%)';
            wrapper.style.border = '4px solid rgba(255, 255, 255, 0.25)';
            wrapper.style.borderRadius = '13px';
            wrapper.style.padding = '0px';
            
            const modal = document.createElement('div');
            modal.style.backgroundColor = 'white';
            modal.style.padding = '0px';
            modal.style.borderRadius = '10px';
            modal.style.width = '70vw';
            modal.style.height = '70vh';
            modal.style.textAlign = 'center';
            
            wrapper.appendChild(modal);
            
            const iframe = document.createElement('iframe');
            iframe.src = '//p7scratchextensions.pages.dev/extras/html/SVGtext';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none'; 
            iframe.style.borderRadius = '10px';
            modal.appendChild(iframe);
            
            overlay.appendChild(wrapper);
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
            });
        }
    );

    class p7SVGtext {
        constructor() {
        }

        getInfo() {
            return {
                id: 'p7SVGtext',
                name: 'SVG Text',
                blocks: [
                    // { blockType: Scratch.BlockType.LABEL, text: "" },
                ]
            };
        }
    }
    Scratch.extensions.register(new p7SVGtext());
})(Scratch);
