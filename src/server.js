import 'dotenv/config';
import app from './app.js';

app.get("/", (req, res) => {
  res.json({
    ok: true, 
    service: "CAC website Backend",
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 3000;
app.listen(3000, () => console.log(`http://localhost:${PORT}`)) // listen on port 3000



