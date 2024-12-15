function fetchLogin(username) {
  return fetch('/api/session/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify( { username } ),
  })
  .catch( err => Promise.reject({ error: 'network-error' }) )
  .then( response => {
    if(!response.ok) {
      return response.json().then( err => Promise.reject(err) );
    }
    return response.json();
  });
}

function fetchCheck() {
  return fetch('/api/session/', {
    method: 'GET',
  })
  .catch( err => Promise.reject({ error: 'network-error' }) )
  .then( response => {
    if(!response.ok) {
      return response.json().then( err => Promise.reject(err) );
    }
    return response.json();
  });
}

function fetchLogout() {
  return fetch('/api/session', {
    method: 'DELETE',
  })
  .catch(err => Promise.reject({ error: 'network-error' }))
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err));
    }
    return response.json();
  });
}

function fetchGetWord() {
  return fetch('/api/word', {
    method: 'GET',
  })
  .catch(err => Promise.reject({ error: 'network-error' }))
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err));
    }
    return response.json();
  });
}

function fetchUpdateWord(word) {
  return fetch('/api/word', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ word }),
  })
  .catch(err => Promise.reject({ error: 'network-error' }))
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err));
    }
    return response.json();
  });
}

export default { fetchLogin, fetchCheck, fetchLogout, fetchGetWord, fetchUpdateWord };