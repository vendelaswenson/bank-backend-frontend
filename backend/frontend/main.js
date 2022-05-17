'use strict'

const postAccs = document.getElementById('accounts');
const accName = document.getElementById('accname');
const accAmount = document.getElementById('accamount');
const postAcc = document.getElementById('createacc');

const loginForm = document.getElementById('login');
const loginName = document.getElementById('loginname');
const loginPass = document.getElementById('loginpassword');

const regUser = document.getElementById('reguser');
const regPass = document.getElementById('regpass');
const welcomeElem = document.getElementById('welcome');
const secretBtn = document.getElementById('secretbtn');
const secretOutput = document.getElementById('secretoutput');
const logoutForm = document.getElementById('logout');
const registerForm = document.getElementById('register');
const accs = document.querySelector('.acc');
const logoutBtn = document.querySelector('.logoutBtn')

let editAccItem = null;
let accounts = [];

const FORM_MODES = {
    CREATE: 'create',
    EDIT: 'edit'
  }

let formMode = FORM_MODES.CREATE;

loginForm.addEventListener('submit', async (e) => { 
    e.preventDefault();
  
    const res = await fetch('/api/accounts/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: loginName.value,
        password: loginPass.value
      })
    });
    const data = await res.json();
    console.log(data);
    showAllAcc();
  });
  
  const getUser = async () => { 
    const res = await fetch('/api/accounts/user');
    const user = await res.json();
  
    console.log(user);
  }
  
getUser();

logoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    await fetch('/api/accounts/logout', { method: 'POST' });
    
    location.reload();
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const res = await fetch('/api/accounts/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: regUser.value,
        password: regPass.value
      })
    });
    const data = await res.json();
    showAllAcc();
    
    welcomeElem.innerText = `Tack för att du registrerat dig, ${data.user}!`;
  });

//   const checkLoggedin = async () => { 
//     const res = await fetch('/api/accounts/loggedin');
//     const data = await res.json();
  
//     if (data.user) {
//       loginForm.classList.add('hidden')
//       welcomeElem.innerText = `Välkommen ${data.user}!`;
//     } else {
//       logoutForm.classList.add('hidden')
//     }
//   }

//   checkLoggedin();



const accTemplate = (data) => `
  <li>
    <h3> Namn: ${data.name}</h3>
    <p> Saldo: ${data.amount}</p>
    <p> Kontonummer: ${data._id}</p>

    <button data-function="edit" data-postid="${data._id}">Sätt in pengar</button>
    <button data-function="edit" data-postid="${data._id}">Ta ut pengar</button>
    <button data-function="delete" data-postid="${data._id}">Ta bort konto</button>
  </li>
`;

const showAllAcc = async () => {
    registerForm.classList.add('hidden');
    loginForm.classList.add('hidden');
    accs.classList.remove('hidden');
    postAccs.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    logoutForm.classList.remove('hidden')


    const response = await fetch('/api/accounts');
    accounts = await response.json();

    postAccs.innerHTML = accounts.map(accTemplate).join('');

    const deleteBtns = document.querySelectorAll("[data-function='delete']");
    const editBtns = document.querySelectorAll('[data-function="edit"]');

deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        await fetch(`/api/accounts/erase/${e.target.dataset.postid}`, {
            method: 'DELETE'
          });
          showAllAcc();
    });
});

editBtns.forEach((btn2) => {
    btn2.addEventListener("click", async (e) => {
        formMode = FORM_MODES.EDIT;
        editAccItem = accounts.find(({ _id }) => _id === e.target.dataset.postid);
        
        accName.value = editAccItem.name;
        accAmount.value = editAccItem.amount;
    });
});
}

postAcc.addEventListener('reset', () => {
    formMode = FORM_MODES.CREATE;
    editAccItem = null;
  });

postAcc.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const useUrl = formMode === FORM_MODES.CREATE ? '/api/accounts/new' : `/api/accounts/update/${editAccItem._id}`;
    const method = formMode === FORM_MODES.CREATE ? 'POST' : 'PUT';
  
    await fetch(useUrl, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: accName.value,
        amount: accAmount.value
      })
    });
    postAcc.reset();
    showAllAcc();
  });

  