const { makeUniversalApp } = require('@electron/universal');
const path = require('path');

(async () => {
  await makeUniversalApp({
    x64AppPath: path.resolve('dist/mac/TercescrowAdmin.app'),
    arm64AppPath: path.resolve('dist/mac-arm64/TercescrowAdmin.app'),
    outAppPath: path.resolve('dist/mac-universal/TercescrowAdmin.app'),
    force: true,
  });
})();
