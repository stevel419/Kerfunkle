async function addToCart(prodNum, priceId, event) {
    event.preventDefault();
    let prodClass = ".product"+prodNum;
    let imgsrc = document.querySelectorAll(prodClass)[0].getAttribute('src');
    let prodName = document.querySelectorAll(prodClass)[1].textContent;
    let prodPrice = document.querySelectorAll(prodClass)[2].textContent;
    let quantity = 1;

    let token = sessionStorage.getItem("authToken");
    if (token) {
        const response = await fetch("/api/add-to-cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ priceId, prodNum, imgsrc, prodName, prodPrice, quantity })
        });
        const data = await response.json();
    }
    saveToStorage(priceId, prodNum, imgsrc, prodName, prodPrice);
    window.location.href = "cart.html";
}
function saveToStorage(priceId, prodNum, imgsrc, prodName, prodPrice) {
    let cart = sessionStorage.getItem("cart");
    let cartItems = cart ? JSON.parse(cart) : [];
    let existingItem = cartItems.find(item => item.priceId === priceId);
    if (existingItem == null) {
        existingItem = {
            priceId, prodNum, imgsrc, prodName, prodPrice, quantity: 1
        };
        cartItems.push(existingItem);
    }
    else {
        cartItems = cartItems.filter(item => item !== existingItem);
        existingItem.quantity += 1;
        cartItems.push(existingItem);
    }
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
}