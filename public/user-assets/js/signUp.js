const nameid = document.getElementById("username")
const emailid = document.getElementById("email")
const phoneid = document.getElementById("phone")
const passwordid = document.getElementById("password")
const errorName = document.getElementById("errorName")
const errorEmail = document.getElementById("errorEmail")
const errorPhone = document.getElementById("errorPhone")
const errorPassword = document.getElementById("errorPassword")
const signform = document.getElementById("signform")

function nameValidateChecking(e) {

    const nameval = nameid.value;
    const namepattern = /^[A-Za-z\s]+$/;
    if (nameval.trim() === "") {
        errorName.style.display = "block";
        errorName.innerHTML = "Please enter a valid name"
    } else if (!namepattern.test(nameval)) {
        errorName.style.display = "block";
        errorName.innerHTML = "Name can only contain alphabets and spaces"
    } else {
        errorName.style.display = "none";
        errorName.innerHTML = ""
    }
}

function emailValidateChecking(e) {

    const emailval = emailid.value;

    const emailpattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailpattern.test(emailval)) {
        errorEmail.style.display = "block";
        errorEmail.innerHTML = "Invalid Email Format"
    } else {
        errorEmail.style.display = "none";
        errorEmail.innerHTML = "";
    }
}

function phoneValidateChecking(e) {

    const phoneval = phoneid.value;

    if (phoneval.trim() === "") {
        errorPhone.style.display = "block"
        errorPhone.innerHTML = "Enter valid phone number"
    } else if (phoneval.length > 10 || phoneval.length < 10) {
        errorPhone.style.display = "block"
        errorPhone.innerHTML = "Enter  10 digit"
    } else {
        errorPhone.style.display = "none";
        errorPhone.innerHTML = "";
    }
}

function passValidateChecking(e) {

    const passval = passwordid.value;
    const alpha = /[a-zA-Z]/;
    const digit = /\d/;

    if (passval.length < 8) {
        errorPassword.style.dispaly = "block";
        errorPassword.innerHTML = "Should contain atleasst 8 characters";

    } else if (!alpha.test(passval) || !digit.test(passval)) {
        errorPassword.style.display = "block"
        errorPassword.innerHTML = "Should contain alphabets and numbers"
    } else {
        errorPassword.style.display = "none"
        errorPassword.innerHTML = ""
    }
}

document.addEventListener("DOMContentLoaded", function () {
    signform.addEventListener("submit", function (e) {
        nameValidateChecking();
        emailValidateChecking();
        phoneValidateChecking();
        passValidateChecking();

        if (
            !nameid || !emailid || !phoneid || !passwordid || !errorName || !errorEmail || !errorPassword || !errorPhone || !signform
        ) {
            console.error("One or more elements not found.")
        }
        if (
            errorName.innerHTML || errorEmail.innerHTML || errorPhone.innerHTML || errorPassword.innerHTML
        ) {
            e.preventDefault()
        }
    })
})



const url = window.location.search.substring(1)
console.log(url)
if (url === 'usertTaken') {
    const spanMsg = document.getElementById('errorName').querySelector('span');
    spanMsg.innerText = "username already taken";
}
if (url === 'emailTaken') {
    const spanMsg = document.getElementById('errorEmail').querySelector('span');
    spanMsg.innerText = "email already taken";
}