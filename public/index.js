// const { response } = require("express");

const serverURL = "http://localhost:80/";

const formAddFile = document.getElementById('formAddFile');
formAddFile.onsubmit = async function(event) {
    event.preventDefault();
    // console.log(event.target.NameOfFile.value);
       
    let url = serverURL + "AddFile";
    var formData = new FormData();
    formData.append("name", event.target.NameOfFile.value);
    const response = await fetch(url, {method:"POST", headers:{}, body: formData});   

    if(response.status == 401){
        drawAuthentication();
        return;
    }

    let fileList = await response.json();
    drawFileList(fileList);
}

const formUpload = document.getElementById('formUploadFile');
formUpload.onsubmit = async function(event) {
    event.preventDefault();

    // console.log(document.getElementById('fileToUpload').files[0]);

    let url = serverURL + "UploadFile";
    var formData = new FormData(); 
    formData.append("file", document.getElementById('fileToUpload').files[0]);

    const response = await fetch(url, {method:"POST", headers:{}, body: formData});     

    if(response.status == 401){
        drawAuthentication();
        return;
    }

    let fileList = await response.json();
    drawFileList(fileList);
    // console.log(event.target.NameOfFile.value);
    
}


// console.log("fs");
window.onload = async function() {

    // let method = "GET";
    // let headers = {};
    // let body;
    // const response = await fetch("sda", { method, headers, body });

    // let data = await response.json();

    //drawAuthentication();

    selectFile('');

    //selectFile("");


    // console.log(data);
    
    document.getElementById('body').onclick = function(event) {
            let target = event.target.closest(".FilePanel");

            // console.log(target);
            if (target?.tagName == "DIV") {
                // selectFile(target.name);
                // console.dir(target);
                // console.log(target['dataset'].name);

                selectFile(target['dataset'].name);
            }
        }
}

function drawAuthentication(){
    document.getElementById('fileTable').innerHTML = "";

    let authenticationField = 
    ` 
    <div class="AuthenticationField">
        <p class="AuthenticationLabel">Авторизация</p>

        <form method="POST" id="formAuthentication" action="/Authentication" class="FormAuthentication" enctype="multipart/form-data">
        <p>Логин</p>
        <input type="email" name="userEmail" class="AuthenticationInput" required>
        <p>Пароль</p>
        <input type="password" name="userPassword" class="AuthenticationInput" required>

        <button id="logIn" class="AuthenticationButton">Войти</button>         
        <button id="registrationIn" class="AuthenticationButton">Регистрация</button>
        </form>
        
    </div>  
    `;

    document.getElementById('fileTable').innerHTML = document.getElementById('fileTable').innerHTML + authenticationField;

    const formAuthentication = document.getElementById('formAuthentication');
    formAuthentication.onsubmit = async function(event) {
    event.preventDefault();

    //console.log(event.submitter.id);
    let url;

    if(event.submitter.id == 'registrationIn'){

        //console.log('yes');

    url = serverURL + "Registration";
    } else {
        if(event.submitter.id == 'logIn'){
            url = serverURL + 'Authentication';
        }
    }

    //console.log(url);

    let formData = new FormData();
    formData.append("email", event.target.userEmail.value);
    // console.log(formData);
    formData.append("password", event.target.userPassword.value);


    
    //console.log(JSON.stringify({email: event.target.userEmail.value, password: event.target.userPassword.value}));

    let responseAuth = await fetch(url, {method:"POST", headers:{}, body: formData});

    //console.log('1');
    let resp = await responseAuth;

    //console.log(resp.status);

    if(resp.status == 200){
        selectFile('');
    }

    }
}

// async function auth(){  

//     url = serverURL + 'Auth';

//     let responseAuth = await fetch(url, {method:"GET", headers:{}});

//     //console.log(responseAuth);

//     if(responseAuth.status == 401){
//         drawAuthentication();
//     }
// }

function drawFileList(fileList){

    document.getElementById('fileTable').innerHTML = "";

    let fileListHTML = fileList.directoryList.reduce((acc, e) => {
        acc = acc +
            `<div data-name="${e.name}" class="FilePanel">
                <img src="/images/folder.png" class="FileImage">
                <p class="FileName">
                    ${e.name}
                </p>
            </div>`;
        return acc;
    }, "");

    fileListHTML = fileListHTML + fileList.fileList.reduce((acc, e) => {
        acc = acc +             
        `<div>
        <a href="${serverURL + "SelectFile?" + e.name}" class="FilePanel">
            <img src="/images/file.png" class="FileImage">
            <p class="FileName">
                ${e.name}
            </p>
        </a>  
    </div>`
        return acc;
    }, "");
    // console.log(list);

    // console.log(document.getElementById('body').innerHTML);

    document.getElementById('fileTable').innerHTML = document.getElementById('fileTable').innerHTML + fileListHTML;
}

async function selectFile(name){    

    // console.log(name);

    let url = serverURL +"SelectFile?" + name;
    const response = await fetch(url, {method:"GET", headers:{}});

    if(response.status == 401){
        drawAuthentication();
        return;
    }

    let fileList = await response.json();

    if(!fileList){
        return {error: 'notAuth'}
    }

    // console.log(fileList);

    drawFileList(fileList);
}