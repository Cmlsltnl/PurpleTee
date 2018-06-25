$(()=>{
    let total = 0;
    const items = $('.item-total');
    for(let i=0 ; i<items.size() ; i++){
        total += parseInt($(items[i])[0].textContent);
    }
    $('#total').append(total);
    if(total == 0){
        console.log($('#checkout-button'));
        $('#checkout-btn').removeClass('btn-success').addClass('disabled btn-secondary');
    }
})