// api/stock.js - VERSI MANUAL (SEMENTARA)
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // SEMENTARA: Stok manual = 10
    // Nanti setelah akun.json beres, kita balikin lagi
    const manualStock = 10;
    
    return res.status(200).json({ 
        success: true, 
        stock: manualStock,
        message: "Manual mode - Stok sementara"
    });
}
