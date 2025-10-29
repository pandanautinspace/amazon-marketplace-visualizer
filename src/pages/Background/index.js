console.log('This is the background page.');
console.log('Put the background scripts here.');
const userID = crypto.randomUUID();
console.log('Generated User ID:', userID);
chrome.storage.local.get(['userID']).then((result) => {
    if (!result.userID) {
        chrome.storage.local.set({ userID: userID }).then(() => {
            console.log('User ID stored in chrome.storage.local:', userID);
        });
    } else {
        console.log(
            'User ID retrieved from chrome.storage.local:',
            result.userID
        );
    }
});
