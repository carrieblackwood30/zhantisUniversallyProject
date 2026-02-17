// Backend/utils/responseHelper.js
function success(res, data, status = 200) {
  return res.status(status).json(data);
}

function error(res, message, status = 400) {
  return res.status(status).json({ error: message });
}

module.exports = { success, error };