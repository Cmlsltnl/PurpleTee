$(()=>{
    $('.showPwd').click(()=>{
        const pwd = $('#pwd')[0];
        const iconDiv = $('#iconDiv')[0];
        if(pwd.type === 'password'){
            pwd.type = 'text';
            $(iconDiv).html('<i class="fa fa-eye-slash" aria-hidden="true"></i>');
        }
        else {
            pwd.type = 'password';
            $(iconDiv).html('<i class="fa fa-eye" aria-hidden="true"></i>');
        }
    })
})