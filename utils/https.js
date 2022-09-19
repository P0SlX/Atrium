const https = require('https');

function sendRequest(url, method, resolve, reject) {
    const domain = url.match(/:\/\/(.[^/]+)/)[1];
    const path = url.match(/:\/\/.[^/]+(.*)/)[1];
    const options = {
        'method': method,
        'hostname': domain,
        'path': path,
        'maxRedirects': 20,
        'headers': {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        },
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

    post: async (url, data) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'POST', resolve, reject);
            const postData = JSON.stringify(data);
            req.write(postData);
            req.end();
        });
    },

    patch: async (url, data) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'PATCH', resolve, reject);
            const postData = JSON.stringify(data);
            req.write(postData);
            req.end();
        });
    },

    put: async (url, data) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'PUT', resolve, reject);
            const postData = JSON.stringify(data);
            req.write(postData);
            req.end();
        });
    },

    delete: async (url) => {
        return new Promise((resolve, reject) => {
            const req = sendRequest(url, 'DELETE', resolve, reject);
            req.end();
        });
    },
};