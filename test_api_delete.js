async function testApiDelete() {
  const res = await fetch('http://localhost:3000/api/yalidine', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: '47a1ba14-ae29-40a9-aeec-bd58ffa72425' })
  });
  const data = await res.json();
  console.log("Status:", res.status, data);
}
testApiDelete();
