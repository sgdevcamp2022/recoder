import fetch from 'node-fetch';

const API_KEY = 'CoMeet_default_secret';
const CoMeet_URL = 'http://localhost:5000/api/v1/meeting';

function getResponse() {
    return fetch(CoMeet_URL, {
        method: 'POST',
        headers: {
            authorization: API_KEY,
            'Content-Type': 'application/json',
        },
    });
}

getResponse().then(async (res) => {
    console.log('Status code:', res.status);
    const data = await res.json();
    console.log('meeting:', data.meeting);
});
