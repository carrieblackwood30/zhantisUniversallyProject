// middleware/cache.js (использует ioredis)
module.exports = (redisClient, ttl = 60) => async (req, res, next) => {
  const key = `groups:${req.originalUrl}`;
  try {
    const cached = await redisClient.get(key);
    if (cached) return res.json(JSON.parse(cached));
    // перехват res.json чтобы записать в кэш
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      redisClient.setex(key, ttl, JSON.stringify(body)).catch(()=>{});
      return originalJson(body);
    };
    next();
  } catch (err) {
    next();
  }
};