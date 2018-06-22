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
                <div class="card-body row">
                    <div class="col-lg-4 com-sm-12">
                        <img class="img-fluid mb-2" src="${product.images[0]}">
                    </div>
                    <div class="col-lg-8 col-sm-12">
                        <h5 class="card-title">${product.name} 
                            <span class="adminBox inline">${product.status}</span>
                        </h5>
                        <p class="card-text">${product.description.substring(0,100)}</p>
                        <a href="/product/${product._id}" class="btn btn-sm btn-primary">See Product</a>
                        <a href="/profile?userId=${product.designer}" class="btn btn-sm btn-primary">Visit Designer</a>
                    </div>
                </div>
            </div>
        </div>
    `)
}