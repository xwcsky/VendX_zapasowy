// backend/test-flow.js
// Ten skrypt wymaga Node.js v18+ (obsługa fetch)

const API_URL = 'http://127.0.0.1:3000';

async function runTest() {
  console.log('🔄 1. TWORZENIE ZAMÓWIENIA...');
  
  try {
    // A. Tworzymy zamówienie (np. Zapach ID "2", Ilość: 3)
    const createRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scentId: '2',
        deviceId: 'test-device-01',
        quantity: 3
      })
    });
    
    const order = await createRes.json();
    console.log('✅ Zamówienie utworzone:', order);

    // B. Symulujemy płatność
    console.log('\n💳 2. SYMULACJA PŁATNOŚCI...');
    const payRes = await fetch(`${API_URL}/payments/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id
      })
    });

    const payResult = await payRes.json();
    console.log('✅ Wynik płatności:', payResult);
    
    console.log('\n🎉 TEST ZAKOŃCZONY! Spójrz teraz do konsoli, gdzie działa serwer NestJS.');
    console.log('Powinieneś tam widzieć komunikat: "--> ROZKAZ WYSŁANY do urządzenia..."');

  } catch (error) {
    console.error('❌ BŁĄD:', error);
  }
}

runTest();