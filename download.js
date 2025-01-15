 // Function to get a query parameter value by name
 function getQueryParam(name) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(name);
}

// Get the docUrl from the query string
const docUrl = getQueryParam('docUrl');
console.log(docUrl);
// Set the href attribute of the download link
if (docUrl) {
    const downloadLink = document.getElementById('link');
    downloadLink.href = docUrl;
    downloadLink.textContent = 'Download your file';
    console.log(docUrl);
} else {
    console.error('docUrl parameter is missing.');
}