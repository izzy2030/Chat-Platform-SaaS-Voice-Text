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

    function sanitizeUrl(url) {
      try {
        var parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
        if (url.startsWith('data:image/')) return url;
      } catch (_) { /* not a valid URL */ }
      return null;
    }

    function setBubbleIcon(container, widgetConfig) {
      while (container.firstChild) container.removeChild(container.firstChild);
      var bubbleIcon = widgetConfig.brand?.bubbleIcon;
      if (bubbleIcon && sanitizeUrl(bubbleIcon)) {
        var img = document.createElement('img');
        img.src = sanitizeUrl(bubbleIcon);
        img.alt = 'Chat';
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.objectFit = 'contain';
        container.appendChild(img);
      } else {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
        svg.appendChild(path);
        container.appendChild(svg);
      }
    }

    setBubbleIcon(bubble, widgetConfig);

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
      while (bubble.firstChild) bubble.removeChild(bubble.firstChild);
      var closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      closeSvg.setAttribute('width', '24');
      closeSvg.setAttribute('height', '24');
      closeSvg.setAttribute('viewBox', '0 0 24 24');
      closeSvg.setAttribute('fill', 'none');
      closeSvg.setAttribute('stroke', 'currentColor');
      closeSvg.setAttribute('stroke-width', '2');
      closeSvg.setAttribute('stroke-linecap', 'round');
      closeSvg.setAttribute('stroke-linejoin', 'round');
      var closePath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      closePath1.setAttribute('d', 'M18 6 6 18');
      var closePath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      closePath2.setAttribute('d', 'm6 6 12 12');
      closeSvg.appendChild(closePath1);
      closeSvg.appendChild(closePath2);
      bubble.appendChild(closeSvg);

    } else {
      iframe.style.display = 'none';
      // Revert to Message Icon (or custom icon)
      var bubbleIcon = widgetConfig.theme?.bubbleIcon || widgetConfig.brand?.bubbleIcon;
      var isVoice = widgetConfig.type === 'voice';

      while (bubble.firstChild) bubble.removeChild(bubble.firstChild);

      if (bubbleIcon && sanitizeUrl(bubbleIcon)) {
        var revertImg = document.createElement('img');
        revertImg.src = sanitizeUrl(bubbleIcon);
        revertImg.alt = 'Chat';
        revertImg.style.width = '32px';
        revertImg.style.height = '32px';
        revertImg.style.objectFit = 'contain';
        bubble.appendChild(revertImg);
      } else if (isVoice) {
        var micSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        micSvg.setAttribute('width', '24');
        micSvg.setAttribute('height', '24');
        micSvg.setAttribute('viewBox', '0 0 24 24');
        micSvg.setAttribute('fill', 'none');
        micSvg.setAttribute('stroke', 'currentColor');
        micSvg.setAttribute('stroke-width', '2');
        micSvg.setAttribute('stroke-linecap', 'round');
        micSvg.setAttribute('stroke-linejoin', 'round');
        var micPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        micPath1.setAttribute('d', 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z');
        var micPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        micPath2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');
        var micLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        micLine.setAttribute('x1', '12');
        micLine.setAttribute('x2', '12');
        micLine.setAttribute('y1', '19');
        micLine.setAttribute('y2', '22');
        micSvg.appendChild(micPath1);
        micSvg.appendChild(micPath2);
        micSvg.appendChild(micLine);
        bubble.appendChild(micSvg);
      } else {
        var msgSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        msgSvg.setAttribute('width', '24');
        msgSvg.setAttribute('height', '24');
        msgSvg.setAttribute('viewBox', '0 0 24 24');
        msgSvg.setAttribute('fill', 'none');
        msgSvg.setAttribute('stroke', 'currentColor');
        msgSvg.setAttribute('stroke-width', '2');
        msgSvg.setAttribute('stroke-linecap', 'round');
        msgSvg.setAttribute('stroke-linejoin', 'round');
        var msgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        msgPath.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
        msgSvg.appendChild(msgPath);
        bubble.appendChild(msgSvg);
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


    // --- Theme Synchronization ---
    function syncThemeWithHost() {
      const isDark = document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        (window.getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)'); // Basic fallback

      const iframe = document.getElementById(IFRAME_ID);
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'THEME_CHANGE',
          mode: isDark ? 'dark' : 'light'
        }, '*');
      }
    }

    // Observe theme changes on the host
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
          syncThemeWithHost();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });

    // Initial sync after iframe loads
    window.addEventListener('message', (event) => {
      if (event.data === 'WIDGET_READY') {
        syncThemeWithHost();
      }
    });

    // Add event listeners
    bubble.addEventListener('click', () => {
      toggleWidget(config, widgetConfig);
      // Sync immediately if just opened
      setTimeout(syncThemeWithHost, 100);
    });

  }

  // Wait for the DOM to be fully loaded before running
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
