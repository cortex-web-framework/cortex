import fs from 'fs';
import path from 'path';

const uiComponentsDistDir = './dist/ui/components';

function getAllJsFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  console.log('Reading dir:', dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllJsFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      if (file.endsWith('.js') && !file.endsWith('.test.js') && !file.endsWith('.metadata.js') && !file.endsWith('.stories.js') && !file.endsWith('.types.js')) {
        console.log('Bundling file:', path.join(dirPath, file));
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const componentFiles = getAllJsFiles(uiComponentsDistDir);
console.log(componentFiles);
