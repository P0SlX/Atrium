function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async (message) => {
    await sleep(15000);
    await message.delete();
};
