'use strict'

const postAccs = document.getElementById('accounts');
const accName = document.getElementById('accname');
const accAmount = document.getElementById('accamount');
const postAcc = document.getElementById('createacc');

let editAccItem = null;
let accounts = [];

const FORM_MODES = {
    CREATE: 'create',
    EDIT: 'edit'
  }

let formMode = FORM_MODES.CREATE;


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
    const response = await fetch('/api/accounts');
    accounts = await response.json();

    console.log('hoho')

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

  


showAllAcc();