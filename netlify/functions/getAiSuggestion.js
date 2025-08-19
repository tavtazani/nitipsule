// File: netlify/functions/getAiSuggestion.js

exports.handler = async function(event, context) {
    // 1. Ambil 'prompt' yang sudah jadi dari aplikasi Anda
    const { prompt } = JSON.parse(event.body);
    
    // Periksa jika prompt tidak ada
    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Prompt tidak ditemukan dalam permintaan." })
        };
    }

    // 2. Ambil API Key yang tersimpan aman di Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    // Periksa jika API Key tidak ada di server
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "GEMINI_API_KEY tidak diatur di server Netlify." })
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    };

    try {
        // 3. Kirim permintaan ke Google dari server Netlify
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            // Jika Google API mengembalikan error, teruskan pesannya
            const errorMessage = result.error ? result.error.message : `Google API Error: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        // 4. Kirim kembali hasilnya ke aplikasi Anda
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
