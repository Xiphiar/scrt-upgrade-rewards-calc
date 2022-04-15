const axios = require('axios');

const oldRestUrl = process.env.OLD_REST_URL
const newRestUrl = process.env.NEW_REST_URL
const oldHeight = process.env.OLD_HEIGHT
const newHeight = process.env.NEW_HEIGHT
const timestamp = process.env.EXPORT_TIMESTAMP

const sleep = duration => new Promise(res => setTimeout(res, duration));

const disableButtons = () => {
    document.getElementById("formButton1").innerHTML = `<div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div>`
    document.getElementById("formButton1").disabled = true
    document.getElementById("formButton2").innerHTML = `<div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div>`
    document.getElementById("formButton2").disabled = true
}

const enableButtons = () => {
    document.getElementById("formButton1").innerHTML = `Method 1 (More Accurate)`
    document.getElementById("formButton1").disabled = false
    document.getElementById("formButton2").innerHTML = `Method 2`
    document.getElementById("formButton2").disabled = false
}

async function tryNTimes({ toTry, onErr = () => true, times = 5, interval = 100}) {
    if (times < 1) throw new Error(`Bad argument: 'times' must be greater than 0, but ${times} was received.`);
    let attemptCount = 0
    while (true) {
        try {
            const result = await toTry();
            return result;
        } catch(error) {
            if(onErr(error)) {
                if (++attemptCount >= times) throw error;
            } else {
                throw error
            }
        }
        await sleep(interval)
    }
}

document.rewardsForm.onsubmit = async() => {
    try {
        //prevent reload
        event.preventDefault();
        disableButtons();

        const address = document.inputForm.address.value;

        //const { result: { total }} = await fetch(url).then(res => res.json())
        const total = await tryNTimes({
            times: 3,
            toTry: async() => {
                const { data: { result: { total }}} = await axios.get(`${oldRestUrl}/distribution/delegators/${address}/rewards?height=${oldHeight}`);
                if (!total.length) throw("zerolength");
                return total;
            },
            onErr: (error) => {
                if (!error.toString().includes('zerolength')) throw error;
                return true
            }
        })
        console.log(total)

        const rewards = parseInt(await total.find((element) => element.denom==="uscrt").amount)
        const rewardsSCRT = rewards / 10e5

        const messageHTML = `${address} claimed <b>${rewardsSCRT.toFixed(6)} SCRT</b> on <b>${timestamp}</b>`
        document.getElementById("message").innerHTML = messageHTML;
        enableButtons();
    } catch(err){
        let errorMsg = err.toString();
        if (err.response) errorMsg = err.response.data.error || err.response.data
        document.getElementById("message").innerHTML = errorMsg;
        enableButtons();
    }

    return true;
};

document.balanceForm.onsubmit = async(e) => {
    try{
        e.preventDefault();
        disableButtons();
        const address = document.inputForm.address.value;

        const oldBalance = await tryNTimes({
            times: 3,
            toTry: async() => {
                const { data: { result: balance }} = await axios.get(`${oldRestUrl}/bank/balances/${address}?height=${oldHeight}`);
                if (!balance.length) throw("zerolength");
                return balance;
            },
            onErr: (error) => {
                if (!error.toString().includes('zerolength')) throw error;
                return true
            }
        })
        console.log(oldBalance)

        const newBalance = await tryNTimes({
            times: 3,
            toTry: async() => {
                const { data: { result: balance }} = await axios.get(`${newRestUrl}/bank/balances/${address}?height=${newHeight}`);
                if (!balance.length) throw("zerolength");
                return balance;
            },
            onErr: (error) => {
                if (!error.toString().includes('zerolength')) throw error;
                return true
            }
        })
        console.log(newBalance)

        //const { result: oldBalance } = await fetch(`${oldRestUrl}/bank/balances/${address}?height=${oldHeight}`).then(res => res.json()).catch((err)=>{throw(err)});
        //const newResult = await fetch(`${newRestUrl}/bank/balances/${address}?height=${newHeight}`).then(res => res.json()).catch((err)=>{throw(err)});
        
        const oldUscrtBalance = await oldBalance.find((element) => element.denom==="uscrt").amount
        const newUscrtBalance = await newBalance.find((element) => element.denom==="uscrt").amount
        
        const change = parseInt(newUscrtBalance) - parseInt(oldUscrtBalance)
        const changeSCRT = change / 10e5;
        
        const messageHTML = `${address} claimed <b>${changeSCRT.toFixed(6)} SCRT</b> on <b>${timestamp}</b>`
        document.getElementById("message").innerHTML = messageHTML;
        enableButtons();

    } catch(err){
        let errorMsg = err.toString();
        if (err.response) errorMsg = err.response.data.error || err.response.data
        document.getElementById("message").innerHTML = errorMsg;
        enableButtons();
    }
}
