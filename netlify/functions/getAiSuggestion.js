// File: netlify/functions/getAiSuggestion.js

exports.handler = async function(event, context) {
    // 1. Ambil data yang dikirim dari aplikasi Anda
    const { diets, avoidances, riceInstruction } = JSON.parse(event.body);
    
    // 2. Ambil API Key yang tersimpan aman di Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    // 3. Buat prompt untuk Gemini (sama seperti sebelumnya)
    const dietText = diets.join(', ').replace(/-/g, ' ');
    const avoidText = avoidances.length > 0 ? `hindari ${avoidances.join(', ')}` : 'tidak ada pantangan';
    
    const prompt = `Anda adalah seorang ahli gizi yang ramah dan kreatif. Berikan TIGA rekomendasi menu makan siang yang BERBEDA ala warteg/kantin karyawan di Indonesia yang sehat dan lezat.

PENTING: Semua menu HARUS menggunakan "${riceInstruction}" sebagai sumber karhidrat.

Kriteria pengguna:
- Tujuan diet: ${dietText}.
- Makanan yang dihindari: ${avoidText}.

Struktur jawaban Anda HARUS dalam format JSON. Buat sebuah array JSON yang berisi 3 objek. Setiap objek harus memiliki kunci berikut: "namaMenu", "isiMenu", "alasanSehat", "estimasiKalori" (hanya angka), dan "estimasiHarga" (hanya angka). JANGAN tambahkan markdown atau format lain, hanya JSON mentah.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    };

    try {
        // 4. Kirim permintaan ke Google dari server Netlify
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Google API Error: ${response.statusText}`);
        }

        const result = await response.json();
        
        // 5. Kirim kembali hasilnya ke aplikasi Anda
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};