/**
 * Simple admin secret header check for medicine uploads.
 * Use a proper auth system in production.
 */
export function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'];
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized admin access',
    });
  }
  next();
}
