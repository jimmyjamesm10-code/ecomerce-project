import { UserInfo } from "./UserInfo.js";

const loginNav = document.querySelector(".login");
const loginDialog = document.getElementById("login-dialog");
const loginForm = document.getElementById("login_form");
const loginError = document.getElementById("login-error");
const loginButton = document.getElementById("login-button");

loginNav.addEventListener("click", () => loginDialog.showModal());
document.getElementById("close-login").addEventListener("click", () => loginDialog.close());

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginButton.disabled = true;

    const loginInfo = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value
    };

    try {
        const response = await fetch("http://localhost:8080/loginrequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginInfo)
        });
        const body = await response.json();

        if (!response.ok) {
            loginButton.disabled = false;
            loginError.textContent = body.message || "Login failed. Please try again.";
            return;
        }

        window.location.href = "ecom";
    } catch (error) {
        loginButton.disabled = false;
        console.error("Login request failed:", error);
        loginError.textContent = "Unable to log in. Please try again.";
    }
});



const registerButton = document.getElementById("register-button");
const registrationForm = document.getElementById("registration_form");
const registrationError = document.getElementById("registration-error");
registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    registerButton.disabled = true;
    registrationError.textContent = "";
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const password = document.getElementById("password").value;

    const userInfo = new UserInfo(name, email, address, password);
    
    try {
        const response = await fetch("http://localhost:8080/registration", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userInfo)
        });

        console.log("HTTP status:", response.status);
        const body = await response.json();

        if (!response.ok) {
            registerButton.disabled = false;
            registrationError.textContent = body.message || "Registration failed. Please try again.";
            return;
        }

        console.log("Registration successful");
        loginDialog.showModal();
    } catch (error) {
        registerButton.disabled = false;
        console.error("Registration request failed:", error);
        registrationError.textContent = "Could not read the registration response. Please try again.";
    }
})

const accountExists = document.createElement("button")
accountExists.type = "button"
accountExists.classList = "account-exists"
accountExists.textContent = "Already have an account?"
registrationForm.appendChild(accountExists)
accountExists.addEventListener("click", () => loginDialog.showModal());

