const https = require('https');

function sendRequest(url, method, resolve, reject) {
    const domain = url.match(/:\/\/(.[^/]+)/)[1];
    const path = url.match(/:\/\/.[^/]+(.*)/)[1];
    const options = {
        'method': method,
        'hostname': domain,
        'path': path,
        'maxRedirects': 20,
    };
    return https.request(options, function(res) {
        const chunks = [];

        res.on("data", function(chunk) {
            chunks.push(chunk);
        });

        res.on("end", function() {
            const body = Buffer.concat(chunks);
            resolve(body.toString());
        });

        res.on("error", function(error) {
            reject(error);
        });
    });
}

module.exports = {
    get: async (url) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'GET', resolve, reject);
            req.end();
        });
    },

    post: (url, data) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'POST', resolve, reject);
            const postData = JSON.stringify(data);
            req.write(postData);
            req.end();
        });
    },

    patch: (url, data) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'PATCH', resolve, reject);
            const postData = JSON.stringify(data);
            req.write(postData);
            req.end();
        });
    },

    put: (url, data) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'PUT', resolve, reject);
            const postData = JSON.stringify(data);
            req.write(postData);
            req.end();
        });
    },

    delete: (url) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'DELETE', resolve, reject);
            req.end();
        });
    },
};