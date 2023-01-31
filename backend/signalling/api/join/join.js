import fetch from 'node-fetch';

const API_KEY = 'CoMeet_default_secret';
const CoMeet_URL = 'https://localhost:5000/api/v1/join';

function getResponse() {
  return fetch(CoMeet_URL, {
    method: 'POST',
    headers: {
      authorization: API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      room: 'Test',
      password: false,
      name: 'CoMeet',
      audio: true,
      video: true,
      screen: true,
      notify: true
    })
  });
}

getResponse().then(async (res) => {
  console.log('Status code:', res.status);
  const data = await res.json();
  console.log('join:', data.join);
});
