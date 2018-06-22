$(()=>{
    loadAdmin();
})

function loadAdmin() {
    $.get('/api/admins')
        .then(admins => {
            admins.forEach(admin => {
                appendAdmin(admin);
            });
        }) 
        .catch(err => {
            console.log(err);
        })
}
function appendAdmin(admin) {
    const adminContainer = $('#adminContainer');
    adminContainer.append(`
        <div class="col-lg-6 com-sm-12">
            <div class="card my-2">
                <div class="card-body row">
                    <div class="col-lg-4 com-sm-12">
                        <img class="img-fluid mb-2" src="${admin.picture}">
                    </div>
                    <div class="col-lg-8 col-sm-12">
                        <h5 class="card-title">@${admin.username} 
                            <span class="adminBox inline">Admin</span>
                        </h5>
                        <p class="card-text">${admin.name}</p>
                        <a href="/profile/${admin.username}" class="btn btn-sm btn-primary">See Profile</a>
                        <a href="/admin/remove/${admin.username}" class="btn btn-sm btn-danger"  onclick="return confirm('Confirm.');">Remove as Admin</a>
                    </div>
                </div>
            </div>
        </div>
    `)
}