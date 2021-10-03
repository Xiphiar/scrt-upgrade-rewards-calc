const chainId = process.env.CHAIN_ID
const restUrl = process.env.REST_URL
const exportHeight = process.env.EXPORT_HEIGHT
const timestamp = process.env.TIMESTAMP

document.sendForm.onsubmit = () => {
    //prevent reload
    event.preventDefault();

    let address = document.sendForm.address.value;
    const url = `${restUrl}/distribution/delegators/${address}/rewards?height=${exportHeight}`
    console.log(url);
    (async () => {
        fetch(url).then(res => res.json())
            .then(response => {
                console.log(response);
                if (response.error){
                    document.getElementById("message").innerHTML = `${response.error}<br />`;
                } else {
                    var amount;
                    if (!response.result.total[0]) {
                        amount = 0;
                    } else {
                        amount = parseInt(response.result.total[0].amount)/1000000;
                    }
                    console.log(amount);
                    const messageHTML = `${address} claimed <b>${amount.toFixed(6)} SCRT</b> on <b>${timestamp}</b>`
                    document.getElementById("message").innerHTML = messageHTML;
                }
            })
            .catch(error => {
                document.getElementById("message").innerHTML = error;
            })
        ;
    })();

    return false;
};
