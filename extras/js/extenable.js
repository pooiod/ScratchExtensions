if (window.location.hostname === 'studio.penguinmod.com') {
    let checks = 0;
    let clicks = 0;

    let interval = setInterval(() => {
        if (checks >= 100) {
            clearInterval(interval);
            return;
        }

        let targetElement = document.querySelector('p.url_url_3Y61f');
        if (targetElement && targetElement.textContent.includes('https://p7scratchextensions.pages.dev/')) {
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
