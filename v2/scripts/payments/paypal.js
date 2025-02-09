




export async function processPaypalPayment() {
  try {
    let bidUSD = '';

    const response = await axios.get("https://economia.awesomeapi.com.br/json/last/USD-MZN")
    const bid = response.data.USDMZN.bid;  // Obtém a cotação 'bid'
    bidUSD = bid;
    console.log(bidUSD);

  } catch (error) {
    console.log(error)
  }

}

