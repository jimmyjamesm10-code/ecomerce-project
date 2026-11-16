import { UserInfo } from "./UserInfo.js";

const registerButton = document.getElementById("register");
const registrationForm = document.getElementById("registration_form");


registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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

        console.log("HTTP status:", response.status)

        if (response.status === 409) {
            console.log(`Registration failed: ${await response.text()}`);
        } else if (!response.ok) {
            throw new Error(`Registration failed: ${response.status}`)
        } else {
            console.log("Registration successful");
        }
    } catch (error) {
        console.error("Registration request failed:", error); 
    }
})

