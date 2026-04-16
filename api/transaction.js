// api/transaction.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { order_id, amount } = req.body;
    
    const PAKASIR_API = "https://app.pakasir.com/api/transactioncreate/qris";
    const PROJECT_SLUG = "praa-store";
    const API_KEY = "EhjOi79MGjlP4yk4r4OXLbh85BOp9hrs";
    
    try {
        const response = await fetch(PAKASIR_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project: PROJECT_SLUG,
                order_id: order_id,
                amount: amount,
                api_key: API_KEY
            })
        });
        
        const data = await response.json();
        
        if (data.payment) {
            return res.status(200).json({
                success: true,
                qr_string: data.payment.payment_number,
                amount: data.payment.total_payment,
                expired_at: data.payment.expired_at,
                order_id: data.payment.order_id
            });
        } else {
            return res.status(400).json({ success: false, error: data });
        }
    } catch (error) {
        console.error('Transaction error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
