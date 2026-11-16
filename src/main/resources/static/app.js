import { Product } from "./product.js"

const loginnav = document.querySelector(".login")
const logindialog = document.getElementById("login-dialog")
loginnav.addEventListener("click", () => {
    logindialog.showModal();
})

const loginButton = document.getElementById("login");
const loginForm = document.getElementById("login_form");
const loginFailureMessage = document.createElement("div");
loginFailureMessage.classList = "login-failure-message"
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const loginInfo = {email:  email, password: password}

    
    const response = await fetch("http://localhost:8080/loginrequest", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(loginInfo)
    })

    const body = await response.json();

    if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}: ${body.message}`);
        loginFailureMessage.textContent = body.message;
        logindialog.appendChild(loginFailureMessage)
        return;    
    }
    console.log(response.status, body.message)
    window.location.href = "ecom"; 
})

async function getProducts() {
    const response = await fetch("http://localhost:8080/products/getall");
    const products = await response.json();
    return products;
}

let Products = await getProducts();
Products = Products.map(item => 
    new Product(item.id, item.name, item.price, item.stock, item.category, item.image)
)
console.log(Products);

const products = Products;
localStorage.setItem("products", JSON.stringify(products));
console.log(products)

function renderProducts() {
    const productsContainer = document.querySelector(".products");

    productsContainer.innerHTML = "";

    products.forEach(product => {

        const ProductElement = document.createElement("div");
        ProductElement.classList.add("product-card");
        ProductElement.addEventListener("click", () => {
            window.location.href = "productdetails"
            localStorage.setItem("selected_product", JSON.stringify(product))
        })

        const productImage = document.createElement("img");
        productImage.width = "100";
        productImage.height ="100";
        productImage.src = product.image;
        productImage.alt = product.name;
        ProductElement.appendChild(productImage);

        const productName = document.createElement("h3");
        productName.textContent = product.name;
        ProductElement.appendChild(productName);

        const productDescription = document.createElement("p");
        //productDescription.textContent = product.description;
        //ProductElement.appendChild(productDescription)

        const productPrice = document.createElement("p");
        productPrice.textContent = `R${product.price}`;
        ProductElement.appendChild(productPrice);

        productsContainer.appendChild(ProductElement);
    })
}

renderProducts()



