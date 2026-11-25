import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';

type Role = 'user' | 'operator' | 'admin';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

interface CatalogStore {
  destinasi?: unknown[];
  kuliner?: unknown[];
  akomodasi?: unknown[];
  paket?: unknown[];
  heroImageUrl?: string;
}

interface UserWorkspace {
  favorites: unknown[];
  itinerary: unknown | null;
}

interface ServerStore {
  users: StoredUser[];
  catalog: CatalogStore | null;
  workspaces: Record<string, UserWorkspace>;
}

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  role: Role;
  exp: number;
}

interface AuthedRequest extends Request {
  authUser?: TokenPayload;
}

const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const DATA_DIR = path.resolve(process.cwd(), '.runtime-data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) as Partial<ServerStore>;
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        catalog: parsed.catalog ?? null,
        workspaces: parsed.workspaces && typeof parsed.workspaces === 'object' ? parsed.workspaces : {},
      };
    }
  } catch {
    // Fallback to clean store
  }
  return { users: [], catalog: null, workspaces: {} };
}

let store: ServerStore = loadStore();

function saveStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch {
    // Keep operating from memory if disk write is unavailable
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(keyHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function constantTimeMatch(input: string, secret: string): boolean {
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

function signToken(payload: Omit<TokenPayload, 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TokenPayload;
    if (!parsed.sub || !parsed.role || typeof parsed.exp !== 'number') return null;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function sanitizeRole(val: unknown): Role | null {
  if (val === 'user' || val === 'operator' || val === 'admin') return val;
  return null;
}

function envAdminPasscode(): string {
  return (process.env.ADMIN_PASSCODE || '').trim();
}

function envOperatorPasscode(): string {
  return (process.env.OPERATOR_PASSCODE || '').trim();
}

function isAdminConfigured(): boolean {
  return Boolean(envAdminPasscode()) || store.users.some((u) => u.role === 'admin');
}

function isOperatorConfigured(): boolean {
  return Boolean(envOperatorPasscode()) || store.users.some((u) => u.role === 'operator');
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: 'Autentikasi diperlukan (Bearer token tidak ditemukan).' });
    return;
  }
  const payload = verifyToken(match[1]);
  if (!payload) {
    res.status(401).json({ error: 'Sesi tidak valid atau telah kedaluwarsa.' });
    return;
  }
  req.authUser = payload;
  next();
}

function requireRoles(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({ error: 'Autentikasi diperlukan.' });
      return;
    }
    if (!roles.includes(req.authUser.role)) {
      res.status(403).json({
        error: `Akses ditolak. Peran '${req.authUser.role}' tidak memiliki izin untuk tindakan ini.`,
      });
      return;
    }
    next();
  };
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Auth Status
  app.get('/api/auth/status', (_req: Request, res: Response) => {
    res.json({
      adminConfigured: isAdminConfigured(),
      operatorConfigured: isOperatorConfigured(),
      envAdminActive: Boolean(envAdminPasscode()),
      envOperatorActive: Boolean(envOperatorPasscode()),
    });
  });

  // First-Run Admin (and optional initial Operator) Setup — locks permanently once claimed
  app.post('/api/auth/bootstrap', (req: Request, res: Response) => {
    if (isAdminConfigured()) {
      res.status(409).json({
        error: 'Akun Admin awal sudah diklaim atau dikonfigurasi melalui environment.',
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const createOperator = Boolean(body.createOperator);
    const opEmail =
      typeof body.operatorEmail === 'string' ? body.operatorEmail.trim().toLowerCase() : '';
    const opPassword = typeof body.operatorPassword === 'string' ? body.operatorPassword : '';

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({ error: 'Nama Admin harus 2–80 karakter.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Format email Admin tidak valid.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Kata sandi Admin minimal 8 karakter.' });
      return;
    }

    if (createOperator) {
      if (!isValidEmail(opEmail) || opEmail === email) {
        res.status(400).json({ error: 'Email Operator harus valid dan berbeda dari email Admin.' });
        return;
      }
      if (opPassword.length < 8 || opPassword.length > 128) {
        res.status(400).json({ error: 'Kata sandi Operator minimal 8 karakter.' });
        return;
      }
    }

    const adminUser: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      name,
      email,
      role: 'admin',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    store.users.push(adminUser);

    if (createOperator) {
      store.users.push({
        id: `usr-${crypto.randomUUID()}`,
        name: 'Operator Wisata Aceh',
        email: opEmail,
        role: 'operator',
        passwordHash: hashPassword(opPassword),
        createdAt: new Date().toISOString(),
      });
    }

    saveStore();

    const token = signToken({
      sub: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    });

    res.status(201).json({
      token,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  });

  // Public Registration (strictly role = 'user')
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({ error: 'Nama lengkap harus 2–80 karakter.' });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Format email tidak valid.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Kata sandi minimal 8 karakter.' });
      return;
    }
    if (store.users.some((u) => u.email === email)) {
      res.status(409).json({ error: 'Email tersebut sudah terdaftar.' });
      return;
    }

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID()}`,
      name,
      email,
      role: 'user',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveStore();

    const token = signToken({
      sub: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: 'user',
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  });

  // Role-Aware Login (User / Operator / Admin)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const expectedRole = sanitizeRole(body.expectedRole);

    if (!expectedRole) {
      res.status(400).json({ error: 'Pilih peran login yang valid (user, operator, atau admin).' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Kata sandi atau kode akses wajib diisi.' });
      return;
    }

    // 1. Check env passcode override for Admin or Operator
    const adminPass = envAdminPasscode();
    if (expectedRole === 'admin' && adminPass && constantTimeMatch(password, adminPass)) {
      const adminEmail = isValidEmail(email) ? email : 'admin@halalexpl-aceh.local';
      const token = signToken({
        sub: 'env-admin',
        name: 'Administrator Utama',
        email: adminEmail,
        role: 'admin',
      });
      res.json({
        token,
        user: {
          id: 'env-admin',
          name: 'Administrator Utama',
          email: adminEmail,
          role: 'admin',
        },
      });
      return;
    }

    const opPass = envOperatorPasscode();
    if (expectedRole === 'operator' && opPass && constantTimeMatch(password, opPass)) {
      const opEmail = isValidEmail(email) ? email : 'operator@halalexpl-aceh.local';
      const token = signToken({
        sub: 'env-operator',
        name: 'Operator Wisata Aceh',
        email: opEmail,
        role: 'operator',
      });
      res.json({
        token,
        user: {
          id: 'env-operator',
          name: 'Operator Wisata Aceh',
          email: opEmail,
          role: 'operator',
        },
      });
      return;
    }

    // 2. Verify stored scrypt account
    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Masukkan email yang valid.' });
      return;
    }

    const found = store.users.find((u) => u.email === email);
    if (!found || !verifyPassword(password, found.passwordHash)) {
      res.status(401).json({ error: 'Email atau kata sandi tidak sesuai.' });
      return;
    }

    if (found.role !== expectedRole) {
      res.status(403).json({
        error: `Akun ini terdaftar sebagai '${found.role}'. Silakan masuk melalui tab peran '${found.role}'.`,
      });
      return;
    }

    const token = signToken({
      sub: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    });

    res.json({
      token,
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        role: found.role,
      },
    });
  });

  // Current Authenticated Session Info
  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res: Response) => {
    res.json({
      user: {
        id: req.authUser!.sub,
        name: req.authUser!.name,
        email: req.authUser!.email,
        role: req.authUser!.role,
      },
    });
  });

  // Admin: User & Operator Account Management
  app.get(
    '/api/admin/users',
    requireAuth,
    requireRoles('admin'),
    (_req: AuthedRequest, res: Response) => {
      res.json({
        users: store.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
      });
    }
  );

  app.post(
    '/api/admin/users',
    requireAuth,
    requireRoles('admin'),
    (req: AuthedRequest, res: Response) => {
      const body = req.body as Record<string, unknown>;
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const role = sanitizeRole(body.role);

      if (!role) {
        res.status(400).json({ error: 'Peran harus user, operator, atau admin.' });
        return;
      }
      if (name.length < 2 || name.length > 80) {
        res.status(400).json({ error: 'Nama harus 2–80 karakter.' });
        return;
      }
      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'Email tidak valid.' });
        return;
      }
      if (password.length < 8 || password.length > 128) {
        res.status(400).json({ error: 'Kata sandi minimal 8 karakter.' });
        return;
      }
      if (store.users.some((u) => u.email === email)) {
        res.status(409).json({ error: 'Email sudah terdaftar.' });
        return;
      }

      const created: StoredUser = {
        id: `usr-${crypto.randomUUID()}`,
        name,
        email,
        role,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      };
      store.users.push(created);
      saveStore();

      res.status(201).json({
        user: {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role,
          createdAt: created.createdAt,
        },
      });
    }
  );

  app.patch(
    '/api/admin/users/:id/role',
    requireAuth,
    requireRoles('admin'),
    (req: AuthedRequest, res: Response) => {
      const targetId = req.params.id;
      const body = req.body as Record<string, unknown>;
      const nextRole = sanitizeRole(body.role);
      if (!nextRole) {
        res.status(400).json({ error: 'Peran tidak valid.' });
        return;
      }
      const user = store.users.find((u) => u.id === targetId);
      if (!user) {
        res.status(404).json({ error: 'Akun tidak ditemukan.' });
        return;
      }
      if (user.id === req.authUser!.sub && nextRole !== 'admin') {
        res.status(400).json({ error: 'Admin tidak dapat menurunkan perannya sendiri.' });
        return;
      }
      user.role = nextRole;
      saveStore();
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }
  );

  app.delete(
    '/api/admin/users/:id',
    requireAuth,
    requireRoles('admin'),
    (req: AuthedRequest, res: Response) => {
      const targetId = req.params.id;
      if (targetId === req.authUser!.sub) {
        res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri yang sedang aktif.' });
        return;
      }
      const idx = store.users.findIndex((u) => u.id === targetId);
      if (idx === -1) {
        res.status(404).json({ error: 'Akun tidak ditemukan.' });
        return;
      }
      store.users.splice(idx, 1);
      saveStore();
      res.json({ deleted: true });
    }
  );

  // Public Catalog Read + Role-Gated Catalog Write (Operator & Admin)
  app.get('/api/catalog', (_req: Request, res: Response) => {
    res.json({ catalog: store.catalog });
  });

  app.put(
    '/api/catalog',
    requireAuth,
    requireRoles('operator', 'admin'),
    (req: AuthedRequest, res: Response) => {
      const body = req.body as Partial<CatalogStore>;
      const current = store.catalog || {};

      // Operator can update destinasi, kuliner, akomodasi; only Admin can modify paket
      if (req.authUser!.role === 'operator' && Array.isArray(body.paket)) {
        res.status(403).json({
          error: 'Hanya Admin yang dapat mengubah data Paket Wisata.',
        });
        return;
      }

      const safeHeroUrl =
        typeof body.heroImageUrl === 'string' &&
        (/^(https:\/\/|\/src\/assets\/images\/|\/api\/media\/)/.test(body.heroImageUrl.trim()))
          ? body.heroImageUrl.trim()
          : current.heroImageUrl;

      store.catalog = {
        destinasi: Array.isArray(body.destinasi) ? body.destinasi : current.destinasi,
        kuliner: Array.isArray(body.kuliner) ? body.kuliner : current.kuliner,
        akomodasi: Array.isArray(body.akomodasi) ? body.akomodasi : current.akomodasi,
        paket: Array.isArray(body.paket) ? body.paket : current.paket,
        heroImageUrl: safeHeroUrl,
      };
      saveStore();
      res.json({ catalog: store.catalog });
    }
  );

  // Operator & Admin: Upload Tourism Image (PNG / JPEG / WEBP, max 2MB)
  app.post(
    '/api/media/upload',
    requireAuth,
    requireRoles('operator', 'admin'),
    (req: AuthedRequest, res: Response) => {
      const body = req.body as Record<string, unknown>;
      const mimeType = typeof body.mimeType === 'string' ? body.mimeType.trim().toLowerCase() : '';
      const base64Data = typeof body.base64Data === 'string' ? body.base64Data.trim() : '';

      const extMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
      };
      const ext = extMap[mimeType];
      if (!ext) {
        res.status(400).json({ error: 'Format gambar harus PNG, JPG/JPEG, atau WEBP.' });
        return;
      }

      if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
        res.status(400).json({ error: 'Data gambar base64 tidak valid.' });
        return;
      }

      const buf = Buffer.from(base64Data, 'base64');
      if (buf.length === 0 || buf.length > 2 * 1024 * 1024) {
        res.status(400).json({ error: 'Ukuran gambar maksimal 2 MB.' });
        return;
      }

      // Magic-byte validation to ensure payload is genuinely a raster image
      const isPng =
        ext === 'png' &&
        buf.length >= 8 &&
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47;
      const isJpg =
        ext === 'jpg' &&
        buf.length >= 3 &&
        buf[0] === 0xff &&
        buf[1] === 0xd8 &&
        buf[2] === 0xff;
      const isWebp =
        ext === 'webp' &&
        buf.length >= 12 &&
        buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buf.subarray(8, 12).toString('ascii') === 'WEBP';

      if (!isPng && !isJpg && !isWebp) {
        res.status(400).json({ error: 'Isi file tidak sesuai dengan format gambar yang dipilih.' });
        return;
      }

      try {
        if (!fs.existsSync(UPLOADS_DIR)) {
          fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }
        const safeName = `${crypto.randomUUID()}.${ext}`;
        const destPath = path.resolve(UPLOADS_DIR, safeName);
        if (!destPath.startsWith(UPLOADS_DIR + path.sep)) {
          res.status(400).json({ error: 'Jalur file tidak diizinkan.' });
          return;
        }
        fs.writeFileSync(destPath, buf);
        res.status(201).json({ imageUrl: `/api/media/${safeName}` });
      } catch {
        res.status(500).json({ error: 'Gagal menyimpan berkas gambar di server.' });
      }
    }
  );

  // Serve Uploaded Media safely
  app.get('/api/media/:filename', (req: Request, res: Response) => {
    const filename = req.params.filename || '';
    if (!/^[a-f0-9-]+\.(png|jpg|webp)$/i.test(filename)) {
      res.status(400).json({ error: 'Nama berkas tidak valid.' });
      return;
    }
    const targetPath = path.resolve(UPLOADS_DIR, filename);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(targetPath)) {
      res.status(404).json({ error: 'Gambar tidak ditemukan.' });
      return;
    }
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(targetPath);
  });

  app.post(
    '/api/catalog/reset',
    requireAuth,
    requireRoles('admin'),
    (_req: AuthedRequest, res: Response) => {
      store.catalog = null;
      saveStore();
      res.json({ reset: true });
    }
  );

  // Authenticated User Workspace (Favorites & Itinerary scoped to authUser.sub)
  app.get('/api/user/workspace', requireAuth, (req: AuthedRequest, res: Response) => {
    const ws = store.workspaces[req.authUser!.sub] || null;
    res.json({ workspace: ws });
  });

  app.put('/api/user/workspace', requireAuth, (req: AuthedRequest, res: Response) => {
    const body = req.body as Partial<UserWorkspace>;
    store.workspaces[req.authUser!.sub] = {
      favorites: Array.isArray(body.favorites) ? body.favorites : [],
      itinerary: body.itinerary ?? null,
    };
    saveStore();
    res.json({ saved: true });
  });

  // Frontend Mounting: Vite middleware in dev, dist/ static in production
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HalalExpl Aceh server listening on http://localhost:${PORT}`);
  });
}

startServer();
