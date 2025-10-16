import axios from 'axios';

async function testCreateOrder() {
    try {
        const dto = {
            scentId: 'lavender',
            deviceId: 'device123'
        };

        const response = await axios.post('http://localhost:3000/orders', dto);
        console.log('Utworzono zamówienie:', response.data);
    } catch (error: any) {
        console.error('Błąd tworzenia zamówienia:', error.response?.data || error.message);
    }
}

testCreateOrder();
