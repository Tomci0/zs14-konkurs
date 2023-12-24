debug = (process.env.VERSION === 'PROD') ? function() {} : console.log;
const fs = require('file-system');
const path = require('path');

module.exports = {
    "url": '/api',
    "mainFile": '/pages/#index.js',
    "loadOtherFiles": function (router) {
        fs.readdir(path.join(__dirname, 'pages'), (err, files) => {
            debug('\n=================================================');
            debug(`Starting to load additional sites for /api [${files.length}] ...`)
            let loadedFiles = 0;
            files.forEach(file => {
                if (!file.startsWith('#')) {
                    loadedFiles++
                    require('./pages/' + file.split('.')[0])(router);
                    debug(`Loaded additional site: /api/${file.split('.')[0]}`);
                } else {
                    debug(`Skipped additional site: /api/${file.split('.')[0]}`);
                }
            });
            debug('Loaded [' + loadedFiles + '] additional sites for /api');
            debug('=================================================\n');
        });
    }
}