// From https://dev.to/flexdinesh/cache-busting-a-react-app-22lk
const fs = require('fs');
const packageJson = require('./package.json');

const version = packageJson.version;

const jsonData = {
    version
};

const jsonContent = JSON.stringify(jsonData);

fs.writeFile('./public/meta.json', jsonContent, 'utf8', function (err) {
    if (err) {
        console.log(`An error occured while writing JSON Object to meta.json (version v${version}`);
        return console.log(err);
    }

    console.log(`meta.json file has been saved with latest version number v${version}`);
});
