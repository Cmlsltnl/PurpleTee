$(()=>{
    loadUsers();
})

function loadUsers() {
    $.get('/api/user')
        .then(users => {
            console.log(users.length);
            users.forEach(singleUser => {
                appendUser(singleUser);
            });
        }) 
        .catch(err => {
            console.log(err);
        })
}
function appendUser(singleUser) {
    const userContainer = $('#userContainer');
    if(singleUser.isAdmin) {
        userContainer.append(`
            <div class="col-lg-6 com-sm-12">
                <div class="card my-2">
                    <div class="card-body row">
                        <div class="col-lg-4 com-sm-12">
                            <img class="img-fluid mb-2" src="${singleUser.picture}">
                        </div>
                        <div class="col-lg-8 col-sm-12">
                            <h5 class="card-title">@${singleUser.username} 
                                <span class="adminBox inline">Admin</span>
                            </h5>
                            <p class="card-text">${singleUser.name}</p>
                            <a href="/${singleUser.username}/profile" class="btn btn-sm btn-primary">See Profile</a>
                        </div>
                    </div>
                </div>
            </div>
        `)
    } else {
        userContainer.append(`
            <div class="col-lg-6 com-sm-12">
                <div class="card my-2">
                    <div class="card-body row">
                        <div class="col-lg-4 com-sm-12">
                            <img class="img-fluid mb-2" src="${singleUser.picture}">
                        </div>
                        <div class="col-lg-8 col-sm-12">
                            <h5 class="card-title">@${singleUser.username}</h5>
                            <p class="card-text">${singleUser.name}</p>
                            <a href="/${singleUser.username}/profile" class="btn btn-sm btn-primary">See Profile</a>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }
}