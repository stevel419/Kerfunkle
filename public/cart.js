window.onload = async function() {
    let cartContents = "";
    let emptyCart = document.querySelector(".empty-cart");
    emptyCart.innerHTML = "";
    let token = sessionStorage.getItem("authToken");

    let cart = sessionStorage.getItem("cart");
    let cartItems;
    if (token) {
        await updateDB(token, cart);
    }
    if (cart && JSON.parse(cart).length !== 0) {
        let cartItems = JSON.parse(cart);
        cartItems.forEach(item => {
            let prodId = item.prodNum;
            cartContents = "<div class=\"item\">\n"
                + "<a href=\"product-info.html?product="+prodId+"\">"
                + "<img class=\"item"+prodId+"\" src=\""+item.imgsrc+"\" alt=\""+item.prodName+"\"/>\n"
                + "<h1 class=\"item"+prodId+"\">"+item.prodName+"</h1></a>\n"
                + "<div class=\"quantity-controls\">\n"
                + "<button class=\"minus\" onclick=\"changeQuantity('minus', '"+prodId+"')\">-</button>\n"
                + "<h2 id=\"quant"+prodId+"\">"+item.quantity+"</h2>\n"
                + "<button class=\"plus\" onclick=\"changeQuantity('plus', '"+prodId+"')\">+</button>\n</div>\n"
                + "<h3 class=\"item"+prodId+"\">"+item.prodPrice+"</h3>\n"
                + "<button class=\"remove-btn\" onclick=\"removeItem('"+prodId+"')\">&#10005;</button>\n</div>\n"
                + cartContents;
        });
        cartContents += "<button id=\"checkout-button\">Checkout</button>"
        document.querySelector(".item-list").innerHTML = cartContents;
    }
    else {
        document.querySelector(".item-list").innerHTML = "";
        emptyCart.innerHTML = "<h4>YOUR CART IS EMPTY</h4>\n"
            + "<a href=\"home.html\" class=\"continue-shopping-btn\">Continue Shopping</a>";
    }

    if (!(document.querySelector(".item-list").innerHTML === "")) {
        const checkoutButton = document.getElementById("checkout-button");
        checkoutButton.addEventListener("click", async () => {
            if (cart) {
                initialize(cart);
            }
            else {
                throw new error("Cart is empty.");
            }
        });
    }

    // Create a Checkout Session
    async function initialize(cart) {
        const stripe = Stripe("pk_test_51QgHTlEPrNsWeR47dkgDdtixe0rOSbrAm2MaTqYiIGx4zB4NwD8rjVdo6CRmy32TLltuaTNju21M8kXbDWpknyri0032d54G9b");
        const fetchClientSecret = async () => {
            const cartForStripe = JSON.parse(cart).map(item => ({
                price: item.priceId,
                quantity: item.quantity,
            }));
            //RECONFIGURE BEFORE PRODUCTION - https://api.yourdomain.com
            const response = await fetch("/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cartItems: cartForStripe }),
            });
            const { clientSecret } = await response.json();
            return clientSecret;
        };

        const checkout = await stripe.initEmbeddedCheckout({
            fetchClientSecret,
        });
        // Mount Checkout
        checkout.mount('#checkout');
    }
}

async function updateDB(token, cart) {
    let cartItems = JSON.parse(cart);
    const response = await fetch("/api/update-DB", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ cartItems })
    });
    const data = await response.json();
}

function changeQuantity(action, prodId) {
    let cartItems = JSON.parse(sessionStorage.getItem("cart"));
    let item = cartItems.find(item => item.prodNum === prodId);
    if (action === 'plus') {
        item.quantity += 1;
        sessionStorage.setItem("cart", JSON.stringify(cartItems));
        window.onload();
    }
    else if (action === 'minus') {
        if (item.quantity > 1) {
            item.quantity -= 1;
            sessionStorage.setItem("cart", JSON.stringify(cartItems));
            window.onload();
        }
        else {
            removeItem(prodId);
        }
    }
}

function removeItem(prodId) {
    let cartItems = JSON.parse(sessionStorage.getItem("cart"));
    cartItems = cartItems.filter(item => item.prodNum !== prodId);
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
    window.onload();
}