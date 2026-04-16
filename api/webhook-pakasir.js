// api/webhook-pakasir.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { order_id, status, amount, payment_method } = req.body;
    
    console.log('📢 Webhook received:', { order_id, status, amount, payment_method });
    
    if (status === 'completed') {
        try {
            const claimRes = await fetch(`${process.env.APP_URL || `https://${req.headers.host}`}/api/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id, source: 'webhook' })
            });
            
            const account = await claimRes.json();
            
            if (account.success) {
                console.log(`✅ Account sent for order ${order_id}: ${account.account}`);
                return res.status(200).json({ 
                    success: true, 
                    message: 'Account claimed successfully',
                    account: account.account
                });
            } else {
                console.log(`❌ Failed to claim account for order ${order_id}`);
            }
        } catch (error) {
            console.error('Claim error in webhook:', error);
        }
    }
    
    res.status(200).json({ status: 'ok', received: true });
}
