export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    return response.status(200).json({})
  }

  try {
    const { message, products = [], categories = [] } = request.body || {}

    if (!message || typeof message !== 'string') {
      return response.status(400).json({ error: 'Message is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return response.status(500).json({ error: 'AI service not configured' })
    }

    const systemPrompt = `You are a helpful shopping assistant for NexMart, an AI-powered e-commerce marketplace. 
You have access to the current product catalog. 
Only recommend products that exist in the catalog. 
Do not invent products, prices, or policies. 
If you don't know the answer, say so and offer to help with something else. 
Keep responses concise and helpful.`

    const catalogContext = JSON.stringify({ products: products.slice(0, 20), categories }, null, 2)

    const body = {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nCatalog:\n${catalogContext}\n\nUser: ${message}` }] }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512
      }
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errorText)
      return response.status(500).json({ error: 'AI service temporarily unavailable' })
    }

    const data = await geminiResponse.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that right now. Please try again."

    return response.status(200).json({ text })
  } catch (error) {
    console.error('Chat API error:', error)
    return response.status(500).json({ error: 'Internal server error' })
  }
}
