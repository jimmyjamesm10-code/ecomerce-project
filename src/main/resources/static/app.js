import { Product } from "./product.js"

const loginNav = document.querySelector(".login");
const loginDialog = document.getElementById("login-dialog");
const loginForm = document.getElementById("login_form");
const loginError = document.getElementById("login-error");
const searchForm = document.getElementById("search-form");
const searchFailureMessage = document.querySelector(".search-failure-message")


loginNav.addEventListener("click", () => loginDialog.showModal());
document.getElementById("close-login").addEventListener("click", () => loginDialog.close());
const loginFormRegister = document.querySelector(".login_form_register");
loginFormRegister.addEventListener("click", () => {
    window.location.href = "registration";
})

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";

    const loginInfo = {
        email: document.getElementById("login-email").value,
        password: document.getElementById("login-password").value
    };

    try {
        const response = await fetch("/loginrequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginInfo)
        });
        const body = await response.json();

        if (!response.ok) {
            loginError.textContent = body.message || "Login failed. Please try again.";
            return;
        }

        window.location.reload();
    } catch (error) {
        console.error("Login request failed:", error);
        loginError.textContent = "Unable to log in. Please try again.";
    }
});

async function getProducts() {
    const response = await fetch("/products/getall");
    const products = await response.json();
    return products;
}


searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const searchText = document.getElementById("search-product-name").value.trim();
    
    try {
        const searchResponse = await fetch(`/products/getsearchproducts?searchedProduct=${encodeURIComponent(searchText)}`)
        let searchedProducts = await searchResponse.json();

        if (!searchResponse.ok) {
            searchFailureMessage.textContent = "Search request failed";
            console.error(searchResponse.error);
            return;
        }
        searchedProducts = searchedProducts.map(item => 
            new Product(item.id, item.name, item.price, item.stock, item.category, item.image)
        )

        if (searchedProducts.length === 0) {
            searchFailureMessage.textContent = "This item is currently not available";
        } else {
            searchFailureMessage.textContent = "";
        }
        renderProducts(searchedProducts);
    } catch {
        searchFailureMessage.textContent = "search request failed";
    }
})

let Products = await getProducts();
Products = Products.map(item => 
    new Product(item.id, item.name, item.price, item.stock, item.category, item.image)
)


localStorage.setItem("products", JSON.stringify(Products));
console.log(Products)

function renderProducts(items) {
    const productsContainer = document.querySelector(".products");

    productsContainer.innerHTML = "";

    items.forEach(product => {

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

renderProducts(Products)



