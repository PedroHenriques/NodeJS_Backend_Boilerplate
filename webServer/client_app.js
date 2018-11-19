'use strict';
const fetch = require('node-fetch');

const serverURL = 'http://localhost:8000/';
let authSessionId = null;

module.exports.createUser = (email, password, name) => {
  const payload = {
    email, password, name
  };

  fetch(`${serverURL}api/v1/users`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Cookie: authSessionId,
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.errors) { throw data.errors; }

    console.log('User created!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.activateUser = (email, token) => {
  const payload = {
    email, token
  };

  fetch(`${serverURL}api/v1/users/activate`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Cookie: authSessionId,
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.errors) { throw data.errors; }

    console.log('User account activated!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.lostPassword = (email) => {
  const payload = {
    email
  };

  fetch(`${serverURL}api/v1/users/lostPw`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Cookie: authSessionId,
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.errors) { throw data.errors; }

    console.log('User account lost password started!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.resetPassword = (email, token, password) => {
  const payload = {
    email, token, password
  };

  fetch(`${serverURL}api/v1/users/pwReset`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Cookie: authSessionId,
    },
    body: JSON.stringify(payload),
  })
  .then(response => response.json())
  .then(data => {
    if (data.errors) { throw data.errors; }

    console.log('User account password reseted!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.login = (email, password) => {
  const payload = {
    email, password
  };

  fetch(`${serverURL}api/v1/login`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Cookie: authSessionId,
    },
    body: JSON.stringify(payload),
  })
  .then(response => {
    const headerCookie = response.headers[Object.getOwnPropertySymbols(response.headers)[0]]['set-cookie'];
    if (headerCookie === undefined) {
      return(Promise.reject('Failed to get the auth cookie from the server\'s response'));
    }

    const reMatches = headerCookie[0].match(/^([^;]+);/i);
    if (reMatches !== null) {
      authSessionId = reMatches[1];
    }

    return(response.json());
  })
  .then(data => {
    if (data.errors) { throw data.errors; }

    console.log('logged in!');
  })
  .catch(error => {
    console.error(error);
  });
}

module.exports.logout = () => {
  fetch(`${serverURL}api/v1/logout`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Cookie: authSessionId,
    },
  })
  .then(response => {
    authSessionId = null;

    return(response.json());
  })
  .then(data => {
    if (data.errors) { throw data.errors; }

    console.log('logged out!');
  })
  .catch(error => {
    console.error(error);
  });
}