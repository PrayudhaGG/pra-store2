// api/restock.js
// Endpoint untuk menerima request restock dari Bot Telegram

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { telegram_id, secret, accounts } = req.body;
    
    // ========== KONFIGURASI ==========
    // GANTI DENGAN MILIKMU!
    const OWNER_TELEGRAM_ID = "8474051991";  // SAMA DENGAN DI bot.js
    const SECRET_KEY = "RahasiaRestock123"; // SAMA DENGAN DI bot.js
    
    const GITHUB_OWNER = process.env.GITHUB_OWNER || "PrayudhaGG";
    const GITHUB_REPO = process.env.GITHUB_REPO || "pra-store2";
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/akun.json`;
    
    // Verifikasi owner
    if (telegram_id !== OWNER_TELEGRAM_ID) {
        return res.status(403).json({ error: 'Unauthorized! Anda bukan owner PRA STORE.' });
    }
    
    if (secret !== SECRET_KEY) {
        return res.status(401).json({ error: 'Invalid secret key' });
    }

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        return res.status(400).json({ error: 'Accounts harus array minimal 1 item' });
    }

    try {
        // Ambil file akun.json saat ini
        const getRes = await fetch(GITHUB_API, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json"
            }
        });

        if (!getRes.ok) throw new Error('Gagal ambil file dari GitHub');
        
        const fileData = await getRes.json();
        const sha = fileData.sha;
        const currentAccounts = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));

        // Tambah akun baru
        const newAccounts = [...currentAccounts, ...accounts];
        const newContent = JSON.stringify(newAccounts, null, 2);
        const encodedContent = Buffer.from(newContent).toString('base64');

        // Update ke GitHub
        const updateRes = await fetch(GITHUB_API, {
            method: 'PUT',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type':application/json',
                Accept: "application/vnd.github.v3+json"
            },
            body: JSON.stringify({
                message: `Bulk restock: +${accounts.length} akun via Telegram (PRA STORE)`,
                content: encodedContent,
                sha: sha,
                branch: "main"
            })
        });

        if (!updateRes.ok) throw new Error('Gagal update GitHub');

        return res.status(200).json({
            success: true,
            added: accounts.length,
            total_stock: newAccounts.length,
            accounts_added: accounts
        });

    } catch (error) {
        console.error('Restock error:', error);
        return res.status(500).json({ error: error.message });
    }
}
