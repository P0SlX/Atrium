const {v1: uuidv1} = require("uuid");
const download = require("download");
const fs = require("fs");

module.exports = async (message) => {
    let attachmentsURL = [];
    message.attachments.forEach(attachment => attachmentsURL.push(attachment.url));


}
