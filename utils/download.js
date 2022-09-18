const https = require('https');
const fs = require('fs');

module.exports = {
    download: (url, filename, filepath) => {
        return new Promise((resolve, reject) => {
            const domain = url.match(/:\/\/(.[^/]+)/)[1];
            const path = url.match(/:\/\/.[^/]+(.*)/)[1];
            const savePath = filepath.slice(-1) === '/' ? `${filepath}${filename}` : `${filepath}/${filename}`;
            const options = {
                'method': 'GET',
                'hostname': domain,
                'path': path,
                'maxRedirects': 20,
            };

            const req = https.request(options, function(res) {
                const file = fs.createWriteStream(savePath);

                res.on("data", function(chunk) {
                    file.write(chunk);
                });

                res.on("end", function(chunk) {
                    file.end();
                    resolve();
                });

                res.on("error", function(error) {
                    file.end();
                    fs.unlink(savePath, (err) => { });
                    reject(error);
                });
            });
            req.end();
        });
    },
};