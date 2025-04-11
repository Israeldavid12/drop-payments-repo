const defaultAdmin = require('../../../backend/config-db/firebase.js')

const rtdb = defaultAdmin.database();



// async function updateBalance(userId) {
//     console.log('USERD ID : ', userId)

//     const balanceRef = rtdb.ref(`users/${userId}/balance`);
//     const paypalBalanceRef = rtdb.ref(`users/${userId}/paypalBalance`);

//     let paymentsRef = rtdb.ref(`users/${userId}/payments`);
//     const snapshot = await paymentsRef.once("value")

//     await balanceRef.transaction(async (balance) => {
//         if (balance === null) {
//             balance = 0; // Inicializa o saldo se não existir
//             console.log('SALDO NULO', balance)
//         }

//         let total = 0;
//         let vendasHoje = 0;
//         let paypalBalance = 0;

//         // Obter a data de hoje
//         const today = new Date();
//         const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
//         const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

//         // Recuperar todas as transações


//         const updates = {}; // Objeto para batch updates
//         let foundNewTransactions = false;
//         let foundNewPayPalTransactions = false;

// snapshot.forEach((childSnapshot) => {
//     const payment = childSnapshot.val();
//     const paymentKey = childSnapshot.key;

//     // Verifique o estado da transação para saldo geral
//     if (payment.estado !== "computado" && payment.originalAmount &&
//         (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa" || payment.paymentMethod === "dp-wallet")) {
//         total += parseFloat(payment.originalAmount);
//         foundNewTransactions = true;

//         // Marcar transação como computada
//         console.log(paymentKey)
//         updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
//     }

//     // Calcular vendas realizadas hoje
//     if (payment.timestamp && payment.originalAmount) {
//         const paymentDate = new Date(payment.timestamp).toISOString();
//         if (paymentDate >= startOfDay && paymentDate <= endOfDay) {
//             vendasHoje += parseFloat(payment.originalAmount);
//         }
//     }

//     // Verifique se a transação é do PayPal
//     if (payment.paymentMethod === "PayPal" && payment.estado !== "computado" && payment.originalAmount) {
//         paypalBalance += parseFloat(payment.originalAmount);
//         foundNewPayPalTransactions = true;

//         // Marcar transação como computada
//         updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
//     }
// });

//         // Arredondar valores para 2 casas decimais
//         total = parseFloat(total.toFixed(2));
//         vendasHoje = parseFloat(vendasHoje.toFixed(2));
//         paypalBalance = parseFloat(paypalBalance.toFixed(2));


//         // Recuperar o saldo atual
//         const balanceSnapshot = await balanceRef.once("value");
//         const currentBalance = balanceSnapshot.val() || 0;

//         const paypalBalanceSnapshot = await paypalBalanceRef.once("value");
//         const currentPayPalBalance = paypalBalanceSnapshot.val() || 0;

//         // Somar os saldos atuais com os novos valores (se houver)
//         let newBalance = currentBalance;
//         let newPayPalBalance = currentPayPalBalance;

//         if (foundNewTransactions) {
//             newBalance = currentBalance + total;
//         }

//         if (foundNewPayPalTransactions) {
//             newPayPalBalance = currentPayPalBalance + paypalBalance;
//         }

//         // Atualizar os saldos no diretório do usuário
//         updates[`users/${userId}/balance`] = newBalance;
//         updates[`users/${userId}/paypalBalance`] = newPayPalBalance;

//         // Salvar todas as atualizações no banco de dados
//         await rtdb.ref().update(updates);


//         return {
//             balance: newBalance,
//             paypalBalance: newPayPalBalance,
//             vendasHoje: vendasHoje,
//             success: true,
//         };
//     }, (error, committed, snapshot) => {
//         if (error) {
//             console.error('Erro ao atualizar saldo:', error);
//             return {
//                 success: false,
//                 error: error.message,
//             };
//         } else if (committed) {
//             console.log('Saldo atualizado com sucesso!', committed);
//             return {
//                 balance: newBalance,
//                 paypalBalance: newPayPalBalance,
//                 vendasHoje: vendasHoje,
//                 success: true,
//             };
//         } else {
//             console.log('Saldo já existe, não foi atualizado novamente.');
//             return true;
//         }
//     });

// }



async function updateBalance(userId) {
    try {
        const userRef = rtdb.ref(`users/${userId}`);
        const balanceRef = rtdb.ref(`users/${userId}/balance`);
        const salesTodayRef = rtdb.ref(`users/${userId}/salesToday`);

        const snapshot = await balanceRef.once('value');
        if (!snapshot.exists()) {
            await balanceRef.set(0)
        }

        const snapshotSalesToday = await salesTodayRef.once('value');
        if (!snapshotSalesToday.exists()) {
            await salesTodayRef.set(0)
        }


        // // Recuperar todas as transações
        const userdata = userRef.transaction((userdata) => {

            if (!userdata) {
                console.log('User not found but');
                return userdata // Retry after 5 seconds  
            } else {
                let vendasHoje = 0;

                const now = new Date();
                const startOfDayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()); // 00:00:00 UTC
                const endOfDayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999); // 23:59:59 UTC


                const currentBalance = userdata.balance;
                let snapshot_payments = userdata.payments || {};
                console.log('snapshotPayments: ', snapshot_payments.length)

                console.log("Saldo atual:", userdata.balance);


                let foundedTransactions = 0;

                let foundNewTransactions = false;

                Object.entries(snapshot_payments).forEach(([paymentKey, payment]) => {
                    // Verifique o estado da transação para saldo geral
                    if (payment.estado !== "computado" && payment.originalAmount &&
                        (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa" || payment.paymentMethod === "dp-wallet")) {
                        foundedTransactions += parseFloat(payment.originalAmount);
                        foundNewTransactions = true;

                        // Marcar transação como computada
                        console.log(paymentKey);
                        userdata.payments[paymentKey].estado = "computado";
                    }


                    // Verifica se a transação foi feita hoje (em UTC)
                    if (payment.timestamp && payment.originalAmount) {

                        const paymentTime = parseInt(payment.timestamp); // garante que é número
                        if (paymentTime >= startOfDayUTC && paymentTime <= endOfDayUTC) {
                            vendasHoje += parseFloat(payment.originalAmount);
                        }
                    }


                });

                let newBalance = 0;

                if (foundNewTransactions) {
                    console.log('vendas encontradas: ', foundedTransactions)
                    newBalance = currentBalance + foundedTransactions;

                    console.log(newBalance)
                    console.log(vendasHoje);

                    userdata.salesToday = vendasHoje;
                    userdata.balance = newBalance; // Atualiza o saldo do usuário
                    return userdata; // Retorna o objeto atualizado  
                }


            }
        }).then((result) => {
            if (result.committed) {
                console.log('Resultado da transação:', result.committed);
                return result.committed; // Retorna o resultado da transação
            } else {
                console.log('Nenhuma venda encontrada');
                return false; // Retorna falso se não houver vendas
            }

        }).catch((error) => {
            console.log('ocorreu um erro', error)
            return false; 
        });


        return userdata;



        // let updates = {};

        // console.log('Caminho da referência:', balanceRef.toString());
        // const result = balanceRef.transaction((currentBalance) => {
        //     console.log('saldo atual: ', currentBalance)
        //     let snapshotPayments = {};

        //     paymentsRef.once("value").then((snapshot) => {
        //         if (snapshot.exists()) {
        //             const data = snapshot.val();
        //             // const sale = '1741901511395'
        //             // console.log("Dados recebidos:", data.sale[sale]);
        //             snapshotPayments = data; // Atribui os dados recebidos à variável snapshotPayments
        //         } else {
        //             console.log("Nenhum dado encontrado.");
        //         }
        //     }).catch((error) => {
        //         console.error("Erro ao buscar dados:", error);
        //     });

        //     console.log('snapshotPayments: ', snapshotPayments.length)

        //     let foundedTransactions = 0;

        //     let foundNewTransactions = false;

        //     snapshotPayments.forEach((childSnapshot) => {
        //         const payment = childSnapshot.val();
        //         const paymentKey = childSnapshot.key;

        //         // Verifique o estado da transação para saldo geral
        //         if (payment.estado !== "computado" && payment.originalAmount &&
        //             (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa" || payment.paymentMethod === "dp-wallet")) {
        //             foundedTransactions += parseFloat(payment.originalAmount);
        //             foundNewTransactions = true;

        //             // Marcar transação como computada
        //             console.log(paymentKey)
        //             updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
        //         }


        //     });

        //     rtdb.ref().update(updates).then(() => {
        //         console.log('Transações atualizadas com sucesso!');
        //     }).catch((error) => {
        //         console.error('Erro ao atualizar transações:', error);
        //     });



        //     //  Somar os saldos atuais com os novos valores (se houver)
        //     console.log('saldo atual : ', currentBalance)
        //     let newBalance = 0;

        //     if (foundNewTransactions) {
        //         console.log('vendas encontradas: ', foundedTransactions)
        //         newBalance = currentBalance + foundedTransactions;
        //         console.log(newBalance)
        //         return newBalance
        //     }

        // }).then(async (result) => {


        //     if (result.committed) {
        //         console.log('commit: ', result.committed)
        //         console.log('snapshot: ', result.snapshot.val())
        //         console.log('Saldo atualizado com sucesso!');
        //         return {
        //             committed: result.committed,
        //             snapshot: result.snapshot.exists(),
        //             success: true,
        //         }
        //     } else {
        //         console.log('Nehuma transacao encontrada.');
        //         return false
        //     }

        // }).catch((error) => {
        //     console.error('Erro ao atualizar saldo:', error);
        //     return false;
        // });
        // console.log(result)

        // return result;

    } catch (error) {
        console.error('Erro ao atualizar saldo:', error);
        return {
            success: false,
            error: error.message,
        };

    }



}




// async function updateBalance(userId, payment) {
//     try {
//         const balanceRef = rtdb.ref(`users/${userId}/balance`);

//         // Primeiro, pegue o saldo atual e as transações antes de chamar a transação
//         const snapshot = await balanceRef.once('value');
//         if (!snapshot.exists()) {
//             await balanceRef.set(0);  // Cria o saldo se não existir
//         }

//         // Recupera as transações antes de executar a transação de saldo
//         const paymentsRef = rtdb.ref(`users/${userId}/payments`);
//         const snapshotPayments = await paymentsRef.once("value");
//         let balanceInit = 0;
//         const updates = {};
//         let foundNewTransactions = false;

//         snapshotPayments.forEach((childSnapshot) => {
//             const payment = childSnapshot.val();
//             const paymentKey = childSnapshot.key;

//             // Verifique o estado da transação para saldo geral
//             if (payment.estado !== "computado" && payment.originalAmount &&
//                 (payment.paymentMethod === "E-Mola" || payment.paymentMethod === "M-pesa" || payment.paymentMethod === "dp-wallet")) {
//                 balanceInit += parseFloat(payment.originalAmount);
//                 foundNewTransactions = true;

//                 // Marcar transação como computada
//                 updates[`users/${userId}/payments/${paymentKey}/estado`] = "computado";
//             }
//         });

//         // Agora, execute a transação para atualizar o saldo com segurança
//         const result = await balanceRef.transaction((currentBalance) => {
//             console.log('Saldo atual: ', currentBalance);

//             let newBalance = currentBalance + (foundNewTransactions ? balanceInit : 0);

//             // Retorna o novo saldo
//             return newBalance;
//         });

//         // Se houver atualizações nas transações, atualize-as
//         if (foundNewTransactions) {
//             await rtdb.ref().update(updates);
//         }

//         if (result.committed) {
//             console.log('Transação concluída. Novo saldo:', result.snapshot.val());
//             console.log('Saldo atualizado com sucesso!');
//             return {
//                 committed: result.committed,
//                 snapshot: result.snapshot.exists(),
//                 success: true,
//             };
//         } else {
//             console.log('Transação falhou ou foi cancelada.');
//             return false;
//         }

//     } catch (error) {
//         console.error('Erro ao atualizar saldo:', error);
//         return {
//             success: false,
//             error: error.message,
//         };
//     }
// }






// setTimeout(async () => {
//     const update =  await updateBalance('iIpkewISsJTlu0Lh7d1YxJ3ZTK12', 100);
//     console.log("resultado: ", update.success)
// })

Promise.all([
    updateBalance('iIpkewISsJTlu0Lh7d1YxJ3ZTK12'),
    updateBalance('iIpkewISsJTlu0Lh7d1YxJ3ZTK12'),
]);


module.exports = { updateBalance };                 