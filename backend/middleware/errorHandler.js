export function errorHandler(err, req, res, next) {
  console.error('[MedAi Error]', err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid data',
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  const msg = err.message || '';

  if (msg.includes('GoogleGenerativeAI') || msg.includes('GEMINI')) {
    if (msg.includes('429') || msg.includes('quota')) {
      return res.status(503).json({
        success: false,
        message:
          'AI quota limit reached. Please wait a minute and try again, or check your Gemini API billing.',
      });
    }
    if (msg.includes('404') || msg.includes('not found')) {
      return res.status(503).json({
        success: false,
        message: 'AI model not available. Check GEMINI_MODEL in backend/.env (use gemini-2.5-flash).',
      });
    }
    return res.status(503).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again later.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}
