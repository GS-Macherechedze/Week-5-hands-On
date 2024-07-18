document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form')

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const authMsg = document.getElementById('auth-msg');

        try{
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers:  {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username, password })
            });

            const data = await response.json();

            if(!response.ok) {
                authMsg.textContent = data
            } else {
                authMsg.textContent = data
            }
        } catch (err) {
            authMsg.textContent = err
        }
    })

})