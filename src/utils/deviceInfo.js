// Device and Browser Information Utility
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // Browser detection
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edge') === -1) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browserName = 'Opera';
    const match = userAgent.match(/OPR\/(\d+)|Opera\/(\d+)/);
    browserVersion = match ? (match[1] || match[2]) : 'Unknown';
  }

  // Operating System detection
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  
  if (platform.indexOf('Win') > -1) {
    osName = 'Windows';
    if (userAgent.indexOf('Windows NT 10.0') > -1) osVersion = '10/11';
    else if (userAgent.indexOf('Windows NT 6.3') > -1) osVersion = '8.1';
    else if (userAgent.indexOf('Windows NT 6.2') > -1) osVersion = '8';
    else if (userAgent.indexOf('Windows NT 6.1') > -1) osVersion = '7';
  } else if (platform.indexOf('Mac') > -1) {
    osName = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    osVersion = match ? match[1].replace('_', '.') : 'Unknown';
  } else if (platform.indexOf('Linux') > -1) {
    osName = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    osName = 'Android';
    const match = userAgent.match(/Android (\d+[.\d]*)/);
    osVersion = match ? match[1] : 'Unknown';
  } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    osName = userAgent.indexOf('iPhone') > -1 ? 'iOS (iPhone)' : 'iOS (iPad)';
    const match = userAgent.match(/OS (\d+[._]\d+)/);
    osVersion = match ? match[1].replace('_', '.') : 'Unknown';
  }

  // Device type detection
  let deviceType = 'Desktop';
  if (/Mobi|Android/i.test(userAgent)) {
    deviceType = 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    deviceType = 'Tablet';
  }

  // Screen information
  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth
  };

  // Timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Language
  const language = navigator.language || navigator.userLanguage;

  // Generate device fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  const canvasFingerprint = canvas.toDataURL();

  const deviceFingerprint = btoa(
    userAgent + 
    platform + 
    screenInfo.width + 
    screenInfo.height + 
    timezone + 
    language + 
    canvasFingerprint.slice(-50)
  ).slice(0, 32);

  return {
    deviceFingerprint,
    browser: {
      name: browserName,
      version: browserVersion,
      userAgent: userAgent
    },
    os: {
      name: osName,
      version: osVersion,
      platform: platform
    },
    device: {
      type: deviceType,
      screen: screenInfo,
      timezone: timezone,
      language: language
    },
    timestamp: new Date().toISOString(),
    ip: null // Will be filled by server
  };
};

// Get approximate location (requires user permission)
export const getLocationInfo = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        });
      },
      (error) => {
        resolve({ 
          error: error.message,
          code: error.code 
        });
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Check if this is a new device/browser combination
export const isNewDevice = (currentDevice, savedDevices) => {
  if (!savedDevices || savedDevices.length === 0) return true;
  
  return !savedDevices.some(saved => 
    saved.deviceFingerprint === currentDevice.deviceFingerprint ||
    (saved.browser.name === currentDevice.browser.name &&
     saved.os.name === currentDevice.os.name &&
     saved.device.type === currentDevice.device.type)
  );
};

export default {
  getDeviceInfo,
  getLocationInfo,
  isNewDevice
};

