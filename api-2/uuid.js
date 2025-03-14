const { v4: uuidv4 } = require('uuid');

console.log(uuidv4())


const url_parms = new URLSearchParams(window.location.search);
const affId = url_parms.get('affId');
const affId_user = { affId, userId_registered };
fetch('https://www.mozbuyit.store/api/affiliates/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(affId_user)
}).then(response => response.json()
).then(data => {
    if (data.estado === 'credited') {
        console.log(data.message)
    }
}).catch((error) => {
    console.log('erro: ', error);
});