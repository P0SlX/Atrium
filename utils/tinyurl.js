const https = require('https');

module.exports = {
    shorten: (url) => {
        return new Promise((resolve, reject) => {
            const options = {
                'method': 'GET',
                'hostname': 'tinyurl.com',
                'path': `/api-create.php?url=${url}`,
                'maxRedirects': 20,
            };

            const req = https.request(options, function(res) {
                const chunks = [];

                res.on("data", function(chunk) {
                    chunks.push(chunk);
                });

                res.on("end", function(chunk) {
                    const body = Buffer.concat(chunks);
                    resolve(body.toString());
                });

                res.on("error", function(error) {
                    reject(error);
                });
            });

            req.end();
        });
    },
};