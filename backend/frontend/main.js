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

const input = document.querySelector('#inputamount');
const inputBtn = document.querySelector('.inputBtn');
const inputLabel = document.querySelector('.inputLabel')

const negInput = document.querySelector('#inputnegamount');
const inputNegBtn = document.querySelector('.inputnegBtn');
const inputNegLabel = document.querySelector('.inputNegLabel')

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
    welcomeElem.innerText = `Välkommen, ${data.name}!`;
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



const accTemplate = (data) => `
  <li>
    <h3> Namn: ${data.name}</h3>
    <p> Saldo: ${data.amount}</p>
    <p> Kontonummer: ${data._id}</p>

    <button data-function="edit" class="inputMonBtn" data-postid="${data._id}">Sätt in pengar</button>
    <button data-function="edit" class="depositMonBtn" data-postid="${data._id}">Ta ut pengar</button>
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
    postAcc.classList.remove('hidden')


    const response = await fetch('/api/accounts');
    accounts = await response.json();

    postAccs.innerHTML = accounts.map(accTemplate).join('');

    const deleteBtns = document.querySelectorAll("[data-function='delete']");
    const inputMonBtn = document.querySelectorAll('.inputMonBtn');
    const depositMonBtn = document.querySelectorAll('.depositMonBtn');


deleteBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        await fetch(`/api/accounts/erase/${e.target.dataset.postid}`, {
            method: 'DELETE'
          });
          showAllAcc();
    });
});

inputMonBtn.forEach((item) => {
    item.addEventListener('click', (e) => {
        input.classList.remove('hidden');
        inputBtn.classList.remove('hidden');
        inputLabel.classList.remove('hidden');
        postAcc.classList.add('hidden');

        inputBtn.addEventListener('click', async () => {
            accAmount.value = +editAccItem.amount + +input.value;

            await fetch(`/api/accounts/update/${e.target.dataset.postid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    name: e.name,
                    amount: accAmount.value
                  })
              });
              showAllAcc();
              postAcc.reset();
              input.classList.add('hidden');
            inputBtn.classList.add('hidden');
            inputLabel.classList.add('hidden');
        })

        formMode = FORM_MODES.EDIT;
        editAccItem = accounts.find(({ _id }) => _id === e.target.dataset.postid);
    })
    
})

depositMonBtn.forEach((item2) => {
    item2.addEventListener('click', async (a) => {
        negInput.classList.remove('hidden');
        inputNegBtn.classList.remove('hidden');
        inputNegLabel.classList.remove('hidden');
        postAcc.classList.add('hidden');


        inputNegBtn.addEventListener('click', async () => {

            accAmount.value = +editAccItem.amount - +negInput.value;

            if(accAmount.value >= 0) {
                await fetch(`/api/accounts/update/${a.target.dataset.postid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        name: a.name,
                        amount: accAmount.value
                      })
                  });
                  showAllAcc();
                  postAcc.reset();
                  negInput.classList.add('hidden');
                    inputNegBtn.classList.add('hidden');
                    inputNegLabel.classList.add('hidden');
            } else {
                alert('You are to broke for this');
        
            }
        })

        formMode = FORM_MODES.EDIT;
        editAccItem = accounts.find(({ _id }) => _id === a.target.dataset.postid);
        console.log(editAccItem);
    })
})

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

  