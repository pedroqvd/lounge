const https = require('https');
const url = 'https://unltgnznpvjfwiqioomh.supabase.co/storage/v1/object/public/video%20publico/bg-hero.mp4';
https.request(url, { method: 'HEAD' }, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
}).end();
