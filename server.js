const express = require("express")
const app = express()
const pool = require("./db.js")

app.use(express.json()); // parse application/json

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    ok: true, 
    service: "CAC website Backend",
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post("/cac/add-dummy-event", async (req, res) => {
  try {
    if (!req.body.club_id || !req.body.title) {
      return res.status(400).json({ error: "club_id and title are required" });
    }

    const result = await pool.query(`
        INSERT INTO events (
          club_id, 
          image_link, 
          title, 
          start_date_time, 
          end_date_time, 
          location, 
          description, 
          sign_up_link
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `, [
        req.body.club_id, 
        req.body.image_link, 
        req.body.title,
        req.body.start_date_time,
        req.body.end_date_time,
        req.body.location,
        req.body.description,
        req.body.sign_up_link
    ])

    res.status(201).json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error("Error inserting event:", error);
    res.status(500).json({ success: false, error: error.message });
  }
})

app.get("/cac/events", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT event_id, club_id, image_link, title, start_date_time, end_date_time, location, description, sign_up_link
      FROM events
      WHERE end_date_time >= NOW()    -- only upcoming or ongoing events
      ORDER BY start_date_time ASC    -- soonest first
    `)

    res.status(200).json({
      success: true,
      count: result.rows.length,
      events: result.rows
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, error: error.message });
  }
})

app.listen(3000)