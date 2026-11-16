

const loginForm = document.getElementById("login_form");
const createAccountButton = document.getElementById("createAccount");
const loginButton = document.getElementById("login")

createAccountButton.addEventListener("click", () => {
    window.location.href = "registration";
})

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginButton.disabled = true;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const loginInfo = {email:  email, password: password}

    
    const response = await fetch("http://localhost:8080/loginrequest", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginInfo)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        window.location.href = "ecom"
        return response.text(); 
    })
    console.log(response);
})