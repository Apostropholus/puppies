import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function run() {
  const searchTerms = ['baby cat', 'baby dog', 'baby deer', 
                       'baby elephant', 'baby panda', 'baby rabbit'];
  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const unsplashRes = await fetch(
    `https://api.unsplash.com/photos/random?query=${randomTerm}&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  );
  const photo = await unsplashRes.json();

  const { data: quotes } = await supabase.from('quotes').select('id');
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('daily_content').upsert({
    date: today,
    image_url: photo.urls.regular,
    image_description: photo.alt_description || '',
    photographer_name: photo.user.name,
    photographer_url: photo.user.links.html,
    quote_id: randomQuote.id
  }, { onConflict: 'date' });

  if (error) {
    console.error('Fehler beim Speichern:', error);
    process.exit(1);
  }

  console.log(`✅ Erfolgreich gespeichert für ${today}: ${randomTerm}`);
}

run();
