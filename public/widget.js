// This is the entry point for the embeddable chat widget script.
// It will be loaded on external websites.

(function () {
  // Simple check to see if we're in a browser environment
  if (typeof window === 'undefined') {
    console.error('Chat Widget: This script must be run in a browser.');
    return;
  }

  // --- Configuration ---
  const SCRIPT_TAG_ID = 'chat-widget-script';
  const IFRAME_ID = 'chat-widget-iframe';
  const CONTAINER_ID = 'chat-widget-container';
  const BUBBLE_ID = 'chat-widget-bubble';

  // --- Helper Functions ---
  function getScriptConfig() {
    const script = document.currentScript || document.getElementById(SCRIPT_TAG_ID);
    if (!script) {
      console.error('Chat Widget: Could not find script tag.');
      return null;
    }
    return {
      key: script.getAttribute('data-key'),
      site: script.getAttribute('data-site'),
      origin: new URL(script.src).origin,
    };
  }

  function createIframe(config, widgetConfig) {
    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.src = `${config.origin}/widget/${config.key}`; // This will be a new page in our Next.js app
    iframe.style.border = 'none';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '100px';
    iframe.style.right = '20px';
    iframe.style.width = '400px';
    iframe.style.maxWidth = '90vw';
    iframe.style.height = '600px';
    iframe.style.maxHeight = '80vh';
    iframe.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 5px 40px';
    iframe.style.borderRadius = '15px';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'none'; // Initially hidden
    iframe.style.zIndex = '9999';

     if (widgetConfig.brand?.position === 'left') {
        iframe.style.left = '20px';
        iframe.style.right = 'auto';
     }


    return iframe;
  }

  function createBubble(widgetConfig) {
    const bubble = document.createElement('div');
    bubble.id = BUBBLE_ID;
    bubble.style.position = 'fixed';
    bubble.style.bottom = '20px';
    bubble.style.right = '20px';
    bubble.style.width = '60px';
    bubble.style.height = '60px';
    bubble.style.borderRadius = '50%';
    bubble.style.backgroundColor = widgetConfig.brand?.bubbleColor || '#000000';
    bubble.style.color = 'white';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    bubble.style.justifyContent = 'center';
    bubble.style.cursor = 'pointer';
    bubble.style.boxShadow = 'rgba(0, 0, 0, 0.1) 0px 4px 12px';
    bubble.style.transition = 'transform 0.2s ease-in-out';
    bubble.style.zIndex = '9998';
    
    // Check if we have a custom bubble icon URL, otherwise use default SVG
    if (widgetConfig.brand?.bubbleIcon && (widgetConfig.brand.bubbleIcon.startsWith('http') || widgetConfig.brand.bubbleIcon.startsWith('data:'))) {
        bubble.innerHTML = `<img src="${widgetConfig.brand.bubbleIcon}" alt="Chat" style="width: 32px; height: 32px; object-fit: contain;">`;
    } else {
        // Default Message Icon
        bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
    }

    if (widgetConfig.brand?.position === 'left') {
        bubble.style.left = '20px';
        bubble.style.right = 'auto';
    }


    bubble.addEventListener('mouseenter', () => {
        bubble.style.transform = 'scale(1.1)';
    });
    bubble.addEventListener('mouseleave', () => {
        bubble.style.transform = 'scale(1)';
    });

    return bubble;
  }

  function toggleWidget(config, widgetConfig) {
    const container = document.getElementById(CONTAINER_ID);
    let iframe = document.getElementById(IFRAME_ID);
    const bubble = document.getElementById(BUBBLE_ID);

    // Lazy Load: Create iframe if it doesn't exist
    if (!iframe) {
        iframe = createIframe(config, widgetConfig);
        container.appendChild(iframe);
    }

    if (iframe.style.display === 'none') {
      iframe.style.display = 'block';
      // Change to Close Icon
      bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

    } else {
      iframe.style.display = 'none';
      // Revert to Message Icon (or custom icon)
      if (widgetConfig.brand?.bubbleIcon && (widgetConfig.brand.bubbleIcon.startsWith('http') || widgetConfig.brand.bubbleIcon.startsWith('data:'))) {
          bubble.innerHTML = `<img src="${widgetConfig.brand.bubbleIcon}" alt="Chat" style="width: 32px; height: 32px; object-fit: contain;">`;
      } else {
          bubble.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
      }
    }
  }

  // --- Main Logic ---
  async function main() {
    const config = getScriptConfig();
    if (!config || !config.key) {
      console.error('Chat Widget: Missing data-key attribute on script tag.');
      return;
    }

    // Fetch widget configuration from our backend
    const res = await fetch(`${config.origin}/api/widget-config?id=${config.key}`);
    if (!res.ok) {
        console.error('Chat Widget: Could not fetch widget configuration.');
        // const error = await res.json();
        // console.error(error.message);
        return;
    }
    const { widget: widgetConfig } = await res.json();

    if (widgetConfig.allowedDomains && widgetConfig.allowedDomains.length > 0 && !widgetConfig.allowedDomains.includes(window.location.hostname)) {
        console.warn(`Chat Widget: Current domain (${window.location.hostname}) is not allowed for this widget.`);
        // return; // Uncomment this for production enforcement
    }

    // Create a container for the widget
    const container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
    
    // Create and append the Bubble ONLY (Iframe is lazy loaded)
    const bubble = createBubble(widgetConfig);
    container.appendChild(bubble);

    // Add event listeners
    bubble.addEventListener('click', () => toggleWidget(config, widgetConfig));

  }

  // Wait for the DOM to be fully loaded before running
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
