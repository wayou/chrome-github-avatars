// Saves options to chrome.storage
function save_options() {
    var isShowAllAvatars = document.getElementById('isShowAllAvatars').checked;
    chrome.storage.sync.set({
        isShowAllAvatars: isShowAllAvatars
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        isShowAllAvatars: false
    }, function (items) {
        console.log(items);
        document.getElementById('isShowAllAvatars').checked = items.isShowAllAvatars;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('isShowAllAvatars').addEventListener('change',
    save_options);