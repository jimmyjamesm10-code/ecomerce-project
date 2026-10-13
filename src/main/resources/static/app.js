import { Product } from "./product.js"

async function getProducts() {
    const response = await fetch("http://192.168.230.203:8080/products");
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



