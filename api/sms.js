const axios = require('axios');

export default async function handler(req, res) {
  // Cache disable
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ site: "Moon US Nums", error: "Missing token" });
  }

  // Asli API endpoint (jo Network tab se mila)
  const target = `https://api.smsflexo.com/api/manual-inbox/${token}/`;

  try {
    const response = await axios.get(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; SM-A556B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Origin": "https://www.api5-sms.top",
        "Referer": "https://www.api5-sms.top/",
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    const data = response.data;

    // Check karo ke response valid JSON hai
    if (!data || typeof data !== 'object') {
      return res.status(200).json({
        site: "Moon US Nums",
        status: "waiting",
        message: "⏳ Waiting for OTP..."
      });
    }

    // OTP extract karo
    const otpRecords = data.order?.otp_records || [];
    const hasOtp = data.order?.has_received_sms === true && otpRecords.length > 0;

    if (!hasOtp) {
      return res.status(200).json({
        site: "Moon US Nums",
        status: "waiting",
        message: "⏳ Waiting for OTP..."
      });
    }

    // Latest OTP code nikalo
    const latestOtp = otpRecords[otpRecords.length - 1];
    const code = latestOtp.otp_code;

    return res.status(200).json({
      site: "Moon US Nums",
      status: "success",
      code: code
    });

  } catch (error) {
    const errorMsg = error.response
      ? `Upstream Error: ${error.response.status}`
      : `Fetch Error: ${error.message}`;
    return res.status(500).json({
      site: "Moon US Nums",
      error: errorMsg,
    });
  }
}
