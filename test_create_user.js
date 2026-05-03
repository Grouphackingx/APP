const email = 'grouphackingx2@gmail.com'; // using a dummy email just in case
const password = 'password123';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@openticket.com', password: 'admin123' })
    });
    const loginData = await res.json();
    const token = loginData.access_token;
    
    console.log("Logged in:", loginData.user.email);

    const createRes = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: email,
        phone: '1234567890',
        password: password,
        role: 'EDITOR'
      })
    });

    const createData = await createRes.json();
    console.log("Create user response:", createRes.status, createData);
  } catch (err) {
    console.error("Test failed", err);
  }
}
test();
