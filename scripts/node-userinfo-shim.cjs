// Node 24 can throw ENOMEM from os.userInfo() on some Windows setups.
// Capacitor only needs the shell field, so provide a safe fallback.
const os = require('node:os');
const originalUserInfo = os.userInfo;
os.userInfo = function userInfoSafe(options) {
  try {
    return originalUserInfo.call(os, options);
  } catch {
    return {
      uid: -1,
      gid: -1,
      username: process.env.USERNAME || 'user',
      homedir: process.env.USERPROFILE || process.cwd(),
      shell: process.env.ComSpec || 'cmd.exe',
    };
  }
};
