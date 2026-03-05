// Test script para verificar el webhook del Input Generator
// Ejecuta esto en la consola del navegador para testear

const testWebhook = async () => {
  const testData = {
    news_items: [
      {
        id: 1,
        title: "Test News 1",
        source: "Test Source",
        snippet: "Test snippet 1",
        content: "Test content 1",
        trend_query: "test trend"
      },
      {
        id: 2,
        title: "Test News 2", 
        source: "Test Source",
        snippet: "Test snippet 2",
        content: "Test content 2",
        trend_query: "test trend"
      },
      {
        id: 3,
        title: "Test News 3",
        source: "Test Source", 
        snippet: "Test snippet 3",
        content: "Test content 3",
        trend_query: "test trend"
      }
    ],
    visual_style: "Modern 3D"
  };

  try {
    console.log('Testing webhook:', 'https://n8nmsi.app.n8n.cloud/webhook/msi-input-generator');
    console.log('Payload:', testData);
    
    const response = await fetch('https://n8nmsi.app.n8n.cloud/webhook/msi-input-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Webhook funcionando correctamente!');
    console.log('Result:', result);
    
  } catch (error) {
    console.error('❌ Error en webhook:', error.message);
    console.error('Full error:', error);
  }
};

// Ejecutar test
testWebhook();