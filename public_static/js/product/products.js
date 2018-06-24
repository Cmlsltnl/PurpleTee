$(()=>{
    loadProduct();
})

function loadProduct() {
    $.get('/api/product')
        .then(products => {
            products.forEach(product => {
                appendProduct(product);
            });
        }) 
        .catch(err => {
            console.log(err);
        })
}
function appendProduct(product) {
    const productContainer = $('#productContainer');
    productContainer.append(`
        <div class="col-lg-6 com-sm-12">
            <div class="card my-2">
            <a href="/product/${product._id}" class="product-link">
                        
            <div class="card-body row">
                        <div class="col-lg-4 com-sm-12">
                            <img class="img-fluid mb-2" src="${product.images[0]}">
                        </div>
                        <div class="col-lg-8 col-sm-12">
                            <h5 class="card-title">${product.name} 
                                <span class="adminBox inline">${product.status}</span>
                            </h5>
                            <p class="card-text">₹ ${product.price}.00</p>
                            <p class="card-text">${product.gender}</p>
                        </div>
                </div>
                </a>

            </div>
        </div>
    `)
}