
export async function feedbackPage() {
    const page = await axios.get("src/static-pages/feedback.html")
    const container = document.createElement('div');
    container.innerHTML = page.data
    return container
}