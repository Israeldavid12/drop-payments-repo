import { addLoadAnim, setAnOutPut } from "../../../animations/index.js";
import { UserData } from "../../../user/v2/userData.js";

async function savePayoutEdits(id) {
    try {
        const payload = {
            id: id || null,
            user_id: await UserData.getUserId(),
            account_holder: document.getElementById('account_holder').value,
            account_id: $("#account_id").val(),
            method_type: $("#payout-method-type").val(),
            reqType: 'set/payout-method',

        }
        const req = await axios.post('http://localhost:3013/api/v2/live/server', payload);
        console.log(req.data)
        setAnOutPut(req.data.message, 'S-M');
        return

    } catch (error) {
        console.error("Erro ao obter UID:", error);
        return error

    }



}


document.getElementById('save-payout-method').addEventListener('click', async () => {
    addLoadAnim('save-payout-method', 'Salvar', true);
    const hash = window.location.hash;
    const match = hash.match(/id=(\d+)/);
    const id = match ? match[1] : null;
    console.log(id);
    await savePayoutEdits(id);

    addLoadAnim('save-payout-method', 'Salvar', false);
});

