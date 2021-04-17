// From https://dev.to/flexdinesh/cache-busting-a-react-app-22lk
const fs = require('fs');

const packageJson = require('./package.json');

const {version} = packageJson;
const jsonContent = JSON.stringify({
    version
});

fs.writeFile('./public/meta.json', jsonContent, 'utf8', (err) => {
    if (err) {
        console.log(`An error occured while writing JSON Object to meta.json (version v${version}`);
        console.log(err);
    }

    console.log(`meta.json file has been saved with latest version number v${version}`);
});
