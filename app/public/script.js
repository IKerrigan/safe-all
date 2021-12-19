let model = {
    accounts: [],
    page : 0,
    prevPage : '',
    nextPage : ''
};

let count = 0;

window.addEventListener('load', function () {
    let formEl = document.getElementById('load');
    formEl.addEventListener('submit', function(e) { 
        e.preventDefault();

    loadAccounts((err, accounts) => {
        model = accounts;

        Transparency.render(document.getElementById('accList'), model.accounts);
    });
});
    let formForw = document.getElementById('forward');
    formForw.addEventListener('submit',function(e) {
            e.preventDefault();

        count++;
        loadAccountsPage((err, accounts) => {
            model = accounts;
            Transparency.render(document.getElementById('accList'), model.accounts);
        });
    });

    let formBack = document.getElementById('back');
    formBack.addEventListener('submit',function(e) {
            e.preventDefault();

        count--;
        loadAccountsPage((err, accounts) => {
            model = accounts;
            Transparency.render(document.getElementById('accList'), model.accounts);
        });
    });
});

function loadAccounts(callback) {
    let uri = '/market/sell';
    let ajax = new XMLHttpRequest();

    //let username = document.getElementById('username').value;
    //let password = document.getElementById('password').value;
    let filter = document.getElementById('filter').value;

    ajax.onerror = function(err) { callback(err, null); };

    ajax.onload = function(response) { 
        let accounts = response.target.responseText;
        callback(null, JSON.parse(accounts)); 
    };

    ajax.open("GET", uri , true);

    ajax.withCredentials = true;

    //ajax.setRequestHeader("Authorization",'Basic ' + btoa(username + ':' + password));
    ajax.setRequestHeader("Filter",filter);        

    ajax.send();
}

function loadAccountsPage(callback) {
    let uri = '/market/sell/' + count;
    let ajax = new XMLHttpRequest();

    //let username = document.getElementById('username').value;
    //let password = document.getElementById('password').value;
    //let filter = document.getElementById('filter').value;    

    ajax.onerror = function(err) { callback(err, null); };

    ajax.onload = function(response) { 
        let accounts = response.target.responseText;
        callback(null, JSON.parse(accounts)); 
    };

    ajax.open("GET", uri , true);

    ajax.withCredentials = true;

    //ajax.setRequestHeader("Authorization",'Basic ' + btoa(username + ':' + password));
    ajax.setRequestHeader("Filter",filter);        
    
    ajax.send();
}