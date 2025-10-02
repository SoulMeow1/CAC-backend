const express = require("express")
const app = express()

app.get("/", (req, res) => {
  res.json({
    ok: true, 
    service: "CAC website Backend",
    timestamp: new Date().toISOString()
  })
})

app.listen(3000)