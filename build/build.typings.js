const fs = require('fs');
const { execSync } = require('child_process');
const vendorConfig = require('./vendor.json');
const pkg = require('../package.json');

const main = () => {
  console.group('\nEmitting type declarations...');
  const distFile = './dist/vconsole.min.d.ts';
  if (fs.existsSync(distFile)) {
    fs.unlinkSync(distFile);
  }
  execSync('tsc --build ./tsconfig.type.json');
  let distContent = fs.readFileSync(distFile, 'utf8');
  for (const name of vendorConfig.name) {
    distContent = distContent.replace(new RegExp(`['"]${name}['"]`, 'g'), `"vendor/${name}"`);
  }

  // If package name differs from "vconsole", add an ambient module declaration
  // matching the actual package name so TypeScript can resolve it correctly.
  if (pkg.name && pkg.name !== 'vconsole') {
    distContent += `\ndeclare module "${pkg.name}" {\n    import { VConsole } from "core/core";\n    export default VConsole;\n}\n`;
  }

  const vendorContent = '/// <reference path="../build/vendor.d.ts" />\n\n';
  fs.writeFileSync(distFile, vendorContent + distContent, 'utf8');
  console.groupEnd();
};

main();