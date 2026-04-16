// api/check-transaction.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { order_id, amount } = req.query;
    
    const PROJECT_SLUG = "praa-store";
    const API_KEY = "EhjOi79MGjlP4yk4r4OXLbh85BOp9hrs";
    const CHECK_URL = `https://app.pakasir.com/api/transactiondetail?project=${PROJECT_SLUG}&amount=${amount}&order_id=${order_id}&api_key=${API_KEY}`;
    
    try {
        const response = await fetch(CHECK_URL);
        const data = await response.json();
        
        if (data.transaction && data.transaction.status === 'completed') {
            return res.status(200).json({
                success: true,
                status: 'completed',
                order_id: data.transaction.order_id
            });
        } else {
            return res.status(200).json({
                success: false,
                status: data.transaction?.status || 'pending'
            });
        }
    } catch (error) {
        console.error('Check transaction error:', error);
        return res.status(500).json({ error: error.message });
    }
}
