require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlparser = require('url')

const { MongoClient } = require('mongodb');

const db_URI = `mongodb+srv://vladpoienariu:admin123@lists.5vhezvm.mongodb.net/?retryWrites=true&w=majority&appName=lists`
const client = new MongoClient(db_URI)
const db = client.db("urlshortner");
const urls = db.collection('urls')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl", function(req, res) {
  let url = req.body.url;
  
  dns.lookup(urlparser.parse(url).hostname, async(err, address) => {
    console.log(address);

    if(address) {
      const url_count = await urls.countDocuments({});
      const urlDoc = {
        url: url,
        short_url: url_count
      }

      const result = await urls.insertOne(urlDoc);
            
      res.json({
        original_url: url,
        short_url: url_count
      })
    }else {
      res.json({
        error: 'invalid url'
      })
    }
  })

})

app.get('/api/shorturl/:short_url', async function(req, res) {
  const url_id = req.params.short_url;

  try {
    const searchUrl = await urls.findOne({ short_url: Number(url_id)})
    
    return res.redirect(searchUrl.url)
  }
  catch(err) {
    return res.json({
     error: 'invalid url'
    })
  }
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
