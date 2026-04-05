async function main() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@admin.com', password: 'password123' })
  });
  if (!loginRes.ok) {
    console.error('Login failed', await loginRes.text());
    return;
  }
  const { access_token } = await loginRes.json();
  
  const orgsRes = await fetch('http://localhost:3000/api/admin/organizers', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  
  if (!orgsRes.ok) {
    console.error('Fetch failed', await orgsRes.text());
    return;
  }
  
  const orgs = await orgsRes.json();
  console.log(`Successfully fetched ${orgs.length} organizers.`);
}
main().catch(console.error);
