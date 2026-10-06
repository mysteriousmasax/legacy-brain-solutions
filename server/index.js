import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import pkg from '@prisma/client'

const { PrismaClient } = pkg
const prisma = new PrismaClient()
const app = express()
app.set('trust proxy', 1)
const port = Number(process.env.PORT || 4000)
const secret = process.env.JWT_SECRET
if (!secret) throw new Error('JWT_SECRET is required')
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './storage/uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({
	dest: uploadDir,
	limits: { fileSize: 25 * 1024 * 1024, files: 1 },
	fileFilter: (request, file, callback) => callback(null, ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)),
})
const profileUpload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (request, file, callback) => callback(null, ['image/jpeg', 'image/png'].includes(file.mimetype)) })
app.use(helmet({ contentSecurityPolicy: false }))
const publicOrigins = (process.env.PUBLIC_URL || '').split(',').map((value) => value.trim()).filter(Boolean)
const allowedOrigins = new Set([process.env.CLIENT_ORIGIN || 'http://localhost:5173', 'http://127.0.0.1:5173', `http://localhost:${port}`, `http://127.0.0.1:${port}`, ...publicOrigins])
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)) }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadDir, { setHeaders: (response) => response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin') }))
app.use(morgan('combined'))
const asyncRoute = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next)
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, skipSuccessfulRequests: true })
const auth = asyncRoute(async (request, response, next) => { const header = request.headers.authorization; if (!header?.startsWith('Bearer ')) return response.status(401).json({ error: 'Authentication required' }); try { request.user = jwt.verify(header.slice(7), secret); next() } catch { response.status(401).json({ error: 'Invalid or expired session' }) } })
const allow = (...types) => (request, response, next) => types.includes(request.user.type) ? next() : response.status(403).json({ error: 'Insufficient permissions' })
const issueToken = (user) => jwt.sign({ sub: user.id, type: user.type, roleId: user.roleId, clientAccountId: user.clientAccountId }, secret, { expiresIn: '8h', issuer: 'legacy-cpa-api' })
const getAdminSessionUser = async (email, password) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD?.trim()
  if (!adminEmail || !adminPassword || email.toLowerCase() !== adminEmail || password !== adminPassword) return null
  const partnerRole = await prisma.role.upsert({
    where: { name: 'Partner' },
    update: {},
    create: { name: 'Partner', description: 'Full firm administration access' },
  })
  const passwordHash = await bcrypt.hash(adminPassword, 12)
  return prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin User',
      passwordHash,
      type: 'ADMIN',
      roleId: partnerRole.id,
    },
    create: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash,
      type: 'ADMIN',
      roleId: partnerRole.id,
    },
    include: { role: true },
  })
}

app.get('/api/health', (request, response) => response.json({ status: 'ok', service: 'legacy-cpa-api', timestamp: new Date().toISOString() }))
app.post('/api/auth/login', loginLimiter, asyncRoute(async (request, response) => { const data = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(request.body); let user = await prisma.user.findUnique({ where: { email: data.email }, include: { role: true } }); if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) { const adminUser = await getAdminSessionUser(data.email, data.password); if (adminUser) user = adminUser; else return response.status(401).json({ error: 'Invalid credentials' }); } response.json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email, type: user.type, role: user.role?.name } }) }))
app.post('/api/auth/register', asyncRoute(async (request, response) => { const data = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), company: z.string().optional(), phone: z.string().min(7).optional(), industry: z.string().optional() }).parse(request.body); const existing = await prisma.user.findUnique({ where: { email: data.email } }); if (existing) return response.status(409).json({ error: 'An account with this email already exists' }); const passwordHash = await bcrypt.hash(data.password, 12); const user = await prisma.$transaction(async (transaction) => { const clientAccount = await transaction.clientAccount.create({ data: { name: data.company || data.name, email: data.email, phone: data.phone, industry: data.industry } }); return transaction.user.create({ data: { name: data.name, email: data.email, passwordHash, type: 'CLIENT', clientAccountId: clientAccount.id }, include: { role: true } }) }); response.status(201).json({ token: issueToken(user), user: { id: user.id, name: user.name, email: user.email, type: user.type, role: user.role?.name } }) }))
app.get('/api/auth/me', auth, asyncRoute(async (request, response) => { const user = await prisma.user.findUnique({ where: { id: request.user.sub }, include: { role: true, clientAccount: true } }); if (!user) return response.status(404).json({ error: 'User not found' }); response.json({ id: user.id, name: user.name, email: user.email, avatarKey: user.avatarKey, type: user.type, role: user.role?.name, clientAccount: user.clientAccount }) }))
app.patch('/api/auth/me', auth, asyncRoute(async (request, response) => { const data = z.object({ name: z.string().min(2), email: z.string().email(), company: z.string().min(2).optional(), phone: z.string().min(7).optional() }).parse(request.body); const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: request.user.sub } } }); if (existing) return response.status(409).json({ error: 'An account with this email already exists' }); const user = await prisma.$transaction(async (transaction) => { const updated = await transaction.user.update({ where: { id: request.user.sub }, data: { name: data.name, email: data.email }, include: { role: true, clientAccount: true } }); if (updated.clientAccountId && (data.company || data.phone)) await transaction.clientAccount.update({ where: { id: updated.clientAccountId }, data: { ...(data.company ? { name: data.company } : {}), ...(data.phone ? { phone: data.phone } : {}) } }); return transaction.user.findUnique({ where: { id: updated.id }, include: { role: true, clientAccount: true } }) }); response.json({ id: user.id, name: user.name, email: user.email, avatarKey: user.avatarKey, type: user.type, role: user.role?.name, clientAccount: user.clientAccount }) }))
app.post('/api/auth/me/photo', auth, profileUpload.single('photo'), asyncRoute(async (request, response) => { if (!request.file) return response.status(400).json({ error: 'Upload a JPG or PNG image up to 5 MB.' }); const user = await prisma.user.update({ where: { id: request.user.sub }, data: { avatarKey: request.file.filename } }); response.status(201).json({ avatarKey: user.avatarKey, avatarUrl: `/uploads/${user.avatarKey}` }) }))
app.get('/api/content/services', asyncRoute(async (request, response) => response.json(await prisma.service.findMany({ where: { active: true } }))))
app.get('/api/content/articles', asyncRoute(async (request, response) => { const limit = Math.min(Number(request.query.limit || 20), 100); response.json(await prisma.article.findMany({ where: { publishedAt: { not: null } }, orderBy: { publishedAt: 'desc' }, take: limit })) }))
app.get('/api/content/offices', asyncRoute(async (request, response) => response.json(await prisma.office.findMany())))
app.get('/api/content/team', asyncRoute(async (request, response) => response.json(await prisma.teamMember.findMany({ where: { active: true }, orderBy: { name: 'asc' } }))))
app.get('/api/content/partners', asyncRoute(async (request, response) => response.json(await prisma.partnerLogo.findMany({ where: { active: true }, orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] }))))
app.get('/api/content/settings', asyncRoute(async (request, response) => response.json(await prisma.firmSettings.findFirst())))
app.post('/api/leads/contact', asyncRoute(async (request, response) => { const data = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), company: z.string().optional(), service: z.string().optional(), message: z.string().min(10) }).parse(request.body); response.status(201).json(await prisma.contactInquiry.create({ data })) }))
app.post('/api/leads/proposals', asyncRoute(async (request, response) => { const data = z.object({ company: z.string().min(2), industry: z.string().optional(), size: z.string().optional(), services: z.array(z.string()).min(1), scope: z.string().min(10), timeline: z.string().optional(), budget: z.string().optional(), name: z.string().min(2), email: z.string().email(), phone: z.string().optional() }).parse(request.body); response.status(201).json(await prisma.proposalRequest.create({ data: { ...data, services: data.services } })) }))
app.post('/api/marketing/newsletter', asyncRoute(async (request, response) => { const data = z.object({ email: z.string().email() }).parse(request.body); const subscription = await prisma.newsletterSubscription.upsert({ where: { email: data.email }, update: { active: true }, create: data }); response.status(201).json({ id: subscription.id, email: subscription.email, active: subscription.active }) }))
app.post('/api/leads/applications', asyncRoute(async (request, response) => { const data = z.object({ company: z.string().min(2), sector: z.string().optional(), services: z.array(z.string()).min(1), name: z.string().min(2), email: z.string().email(), phone: z.string().min(7) }).parse(request.body); response.status(201).json(await prisma.clientApplication.create({ data })) }))
app.get('/api/admin/overview', auth, allow('ADMIN', 'STAFF'), asyncRoute(async (request, response) => { const [clients, engagements, pending, revenue] = await Promise.all([prisma.clientAccount.count(), prisma.engagement.count({ where: { status: 'ACTIVE' } }), prisma.contactInquiry.count({ where: { status: 'NEW' } }), prisma.payment.aggregate({ _sum: { amount: true } })]); response.json({ clients, engagements, pendingRequests: pending, revenue: revenue._sum.amount || 0 }) }))
app.get('/api/admin/clients', auth, allow('ADMIN', 'STAFF'), asyncRoute(async (request, response) => response.json(await prisma.clientAccount.findMany({ include: { engagements: true }, orderBy: { createdAt: 'desc' } }))))
app.get('/api/admin/engagements', auth, allow('ADMIN', 'STAFF'), asyncRoute(async (request, response) => response.json(await prisma.engagement.findMany({ include: { client: true, assignments: { include: { user: true } } }, orderBy: { updatedAt: 'desc' } }))))
app.get('/api/admin/orders', auth, allow('ADMIN', 'STAFF'), asyncRoute(async (request, response) => response.json(await prisma.engagement.findMany({ include: { client: true }, orderBy: { updatedAt: 'desc' } }))))
app.post('/api/admin/engagements', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = z.object({ clientId: z.string().min(1), reference: z.string().min(3), service: z.string().min(2), dueDate: z.coerce.date().optional() }).parse(request.body); response.status(201).json(await prisma.engagement.create({ data: { ...data, status: 'INQUIRY' }, include: { client: true } })) }))
app.patch('/api/admin/engagements/:id', auth, allow('ADMIN', 'STAFF'), asyncRoute(async (request, response) => { const data = z.object({ service: z.string().min(2).optional(), status: z.enum(['INQUIRY', 'ACTIVE', 'REVIEW', 'COMPLETE', 'ARCHIVED']).optional(), dueDate: z.coerce.date().optional() }).parse(request.body); response.json(await prisma.engagement.update({ where: { id: request.params.id }, data, include: { client: true } })) }))
app.get('/api/admin/staff', auth, allow('ADMIN'), asyncRoute(async (request, response) => response.json(await prisma.user.findMany({ where: { type: { in: ['ADMIN', 'STAFF'] } }, include: { role: true } }))))
app.post('/api/admin/staff', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), roleId: z.string().optional() }).parse(request.body); const existing = await prisma.user.findUnique({ where: { email: data.email } }); if (existing) return response.status(409).json({ error: 'An account with this email already exists' }); const passwordHash = await bcrypt.hash(data.password, 12); const user = await prisma.user.create({ data: { name: data.name, email: data.email, passwordHash, type: 'STAFF', roleId: data.roleId }, include: { role: true } }); response.status(201).json(user) }))
app.patch('/api/admin/staff/:id', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = z.object({ name: z.string().min(2), email: z.string().email(), roleId: z.string().nullable().optional(), password: z.string().min(8).optional() }).parse(request.body); const existing = await prisma.user.findFirst({ where: { email: data.email, NOT: { id: request.params.id } } }); if (existing) return response.status(409).json({ error: 'An account with this email already exists' }); const user = await prisma.user.update({ where: { id: request.params.id }, data: { name: data.name, email: data.email, roleId: data.roleId, ...(data.password ? { passwordHash: await bcrypt.hash(data.password, 12) } : {}) }, include: { role: true } }); response.json(user) }))
app.get('/api/admin/roles', auth, allow('ADMIN'), asyncRoute(async (request, response) => response.json(await prisma.role.findMany({ include: { permissions: { include: { permission: true } }, users: true } }))))
app.get('/api/admin/team', auth, allow('ADMIN'), asyncRoute(async (request, response) => response.json(await prisma.teamMember.findMany({ orderBy: { name: 'asc' } }))))
app.patch('/api/admin/team/:id', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = z.object({ name: z.string().min(2), title: z.string().min(2), bio: z.string().optional(), email: z.string().email().optional(), active: z.boolean().optional() }).parse(request.body); response.json(await prisma.teamMember.update({ where: { id: request.params.id }, data })) }))
app.post('/api/admin/team/:id/photo', auth, allow('ADMIN'), profileUpload.single('photo'), asyncRoute(async (request, response) => { if (!request.file) return response.status(400).json({ error: 'Upload a JPG or PNG image up to 5 MB.' }); const member = await prisma.teamMember.update({ where: { id: request.params.id }, data: { imageKey: request.file.filename } }); response.status(201).json(member) }))
const partnerLogoSchema = z.object({ name: z.string().min(2), type: z.enum(['INSTITUTIONAL', 'CLIENT']), website: z.string().url().or(z.literal('')).optional(), sortOrder: z.coerce.number().int().min(0).optional(), active: z.boolean().optional() })
app.get('/api/admin/partners', auth, allow('ADMIN'), asyncRoute(async (request, response) => response.json(await prisma.partnerLogo.findMany({ orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] }))))
app.post('/api/admin/partners', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = partnerLogoSchema.parse(request.body); response.status(201).json(await prisma.partnerLogo.create({ data: { ...data, website: data.website || null } })) }))
app.patch('/api/admin/partners/:id', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = partnerLogoSchema.partial().parse(request.body); response.json(await prisma.partnerLogo.update({ where: { id: request.params.id }, data: { ...data, ...(data.website !== undefined ? { website: data.website || null } : {}) } })) }))
app.post('/api/admin/partners/:id/logo', auth, allow('ADMIN'), profileUpload.single('logo'), asyncRoute(async (request, response) => { if (!request.file) return response.status(400).json({ error: 'Upload a JPG or PNG image up to 5 MB.' }); response.status(201).json(await prisma.partnerLogo.update({ where: { id: request.params.id }, data: { imageKey: request.file.filename } })) }))
app.delete('/api/admin/partners/:id', auth, allow('ADMIN'), asyncRoute(async (request, response) => { await prisma.partnerLogo.delete({ where: { id: request.params.id } }); response.status(204).end() }))
app.get('/api/admin/settings', auth, allow('ADMIN'), asyncRoute(async (request, response) => response.json(await prisma.firmSettings.findFirst())))
app.put('/api/admin/settings', auth, allow('ADMIN'), asyncRoute(async (request, response) => { const data = z.object({ firmName: z.string().min(2), registrationNo: z.string().optional(), address: z.string().optional(), city: z.string().optional(), country: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), description: z.string().optional() }).parse(request.body); const current = await prisma.firmSettings.findFirst(); const settings = current ? await prisma.firmSettings.update({ where: { id: current.id }, data }) : await prisma.firmSettings.create({ data }); response.json(settings) }))
app.get('/api/portal/documents', auth, allow('CLIENT'), asyncRoute(async (request, response) => response.json(await prisma.document.findMany({ where: { clientId: request.user.clientAccountId }, include: { engagement: true, versions: true }, orderBy: { createdAt: 'desc' } }))))
app.post('/api/portal/documents', auth, allow('CLIENT'), upload.single('file'), asyncRoute(async (request, response) => { if (!request.file) return response.status(400).json({ error: 'A supported file is required' }); const document = await prisma.document.create({ data: { name: request.file.originalname, storageKey: request.file.filename, mimeType: request.file.mimetype, size: request.file.size, clientId: request.user.clientAccountId } }); response.status(201).json(document) }))
app.get('/api/portal/engagements', auth, allow('CLIENT'), asyncRoute(async (request, response) => response.json(await prisma.engagement.findMany({ where: { clientId: request.user.clientAccountId }, include: { tasks: true } }))))
app.get('/api/portal/invoices', auth, allow('CLIENT'), asyncRoute(async (request, response) => response.json(await prisma.invoice.findMany({ where: { clientId: request.user.clientAccountId }, include: { payments: true }, orderBy: { dueDate: 'asc' } }))))
app.get('/api/portal/messages', auth, allow('CLIENT'), asyncRoute(async (request, response) => response.json(await prisma.message.findMany({ where: { clientId: request.user.clientAccountId }, orderBy: { createdAt: 'desc' } }))))
app.get('/api/portal/summary', auth, allow('CLIENT'), asyncRoute(async (request, response) => { const clientId = request.user.clientAccountId; const [client, engagements, documents, invoices, messages] = await Promise.all([prisma.clientAccount.findUnique({ where: { id: clientId } }), prisma.engagement.findMany({ where: { clientId }, include: { tasks: true }, orderBy: { updatedAt: 'desc' }, take: 5 }), prisma.document.findMany({ where: { clientId }, include: { engagement: true }, orderBy: { createdAt: 'desc' }, take: 5 }), prisma.invoice.findMany({ where: { clientId }, orderBy: { dueDate: 'asc' }, take: 5 }), prisma.message.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' }, take: 5 })]); response.json({ client, engagements, documents, invoices, messages, counts: { activeEngagements: engagements.filter((item) => item.status === 'ACTIVE').length, documentsAwaitingReview: documents.filter((item) => item.status === 'PENDING_REVIEW' || item.status === 'REVIEW').length, invoicesDue: invoices.filter((item) => item.status === 'SENT' || item.status === 'OVERDUE').length, unreadMessages: messages.filter((item) => !item.readAt).length } }) }))
const webDir = path.resolve('./dist')
if (fs.existsSync(webDir)) {
	app.use(express.static(webDir))
	app.get(/^(?!\/api\/|\/uploads\/).*/, (request, response) => response.sendFile(path.join(webDir, 'index.html')))
}
app.use((error, request, response, next) => { if (error instanceof z.ZodError) return response.status(400).json({ error: 'Validation failed', details: error.flatten() }); console.error(error); if (error.name === 'PrismaClientInitializationError') return response.status(503).json({ error: 'The registration service is temporarily unavailable. Please try again shortly.' }); response.status(500).json({ error: 'Internal server error' }) })
app.listen(port, '0.0.0.0', () => { console.log(`Legacy Brain Solutions website listening on http://localhost:${port}`); if (publicOrigins.length) console.log(`Accepting connections for: ${publicOrigins.join(', ')}`) })