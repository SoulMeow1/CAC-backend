export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!parsed.success) {
      const issues = parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message }));
      return res.status(400).json({ error: 'ValidationError', issues });
    }
    req.valid = parsed.data; // attach validated data
    next();
  };
}