'use client';

let googleMapsPromise;

async function getGoogleMapsApiKey() {
  const response = await fetch('/api/maps-config', { cache: 'no-store' });
  if (!response.ok) throw new Error('Google Maps configuration is unavailable.');
  const configuration = await response.json();
  if (!configuration.apiKey) throw new Error('Google Maps configuration is unavailable.');
  return configuration.apiKey;
}

export function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = getGoogleMapsApiKey().then((apiKey) => new Promise((resolve, reject) => {
    const callbackName = '__kavachGoogleMapsReady';
    const existingScript = document.querySelector('script[data-kavach-google-maps]');

    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error('Google Maps loaded without the Maps API.'));
    };

    if (existingScript) {
      existingScript.addEventListener('error', () => reject(new Error('Google Maps failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.kavachGoogleMaps = 'true';
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${callbackName}`;
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.appendChild(script);
  }));

  return googleMapsPromise;
}
