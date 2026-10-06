import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const main = async () => {
	const adminEmail = process.env.ADMIN_EMAIL || 'legacybrain.co@gmail.com'
	const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
	if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || adminPassword.length < 16)) throw new Error('Production seeding requires ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters.')
	const passwordHash = await bcrypt.hash(adminPassword, 12)
	const role = await prisma.role.upsert({ where: { name: 'Partner' }, update: {}, create: { name: 'Partner', description: 'Full firm administration access' } })
	await prisma.user.upsert({ where: { email: adminEmail }, update: {}, create: { email: adminEmail, name: 'Admin User', passwordHash, type: 'ADMIN', roleId: role.id } })
	for (const service of [
		{ slug: 'audit-assurance', name: 'Audit & Assurance', summary: 'Independent assurance for confident decisions.', body: 'Statutory, internal, and special purpose audits.' },
		{ slug: 'tax-advisory', name: 'Tax Advisory', summary: 'Strategic tax planning and compliance.', body: 'Practical support for a changing Tanzanian tax landscape.' },
	]) await prisma.service.upsert({ where: { slug: service.slug }, update: service, create: service })
	const office = { name: 'Dar es Salaam Office', address: 'Legacy Tower, 4th Floor, Haile Selassie Road, Oysterbay, Dar es Salaam', phone: '+255 765 953 094', email: 'legacybrain.co@gmail.com', hours: 'Monday to Friday, 08:00 to 17:00' }
	const existingOffice = await prisma.office.findFirst({ where: { name: office.name } })
	if (existingOffice) await prisma.office.update({ where: { id: existingOffice.id }, data: office })
	else await prisma.office.create({ data: office })
	const settings = { firmName: 'Legacy Brain Solutions Limited', registrationNo: 'PF 434', address: 'Legacy Tower, 4th Floor, Haile Selassie Road, Oysterbay', city: 'Dar es Salaam', country: 'Tanzania', email: 'legacybrain.co@gmail.com', phone: '+255 765 953 094', description: 'Company registration, institutions, compliance, accountancy, legal issues, and tax consultation services.' }
	const existingSettings = await prisma.firmSettings.findFirst()
	if (existingSettings) await prisma.firmSettings.update({ where: { id: existingSettings.id }, data: settings })
	else await prisma.firmSettings.create({ data: settings })
	for (const member of [
		{ name: 'Ephraim Mushi, CPA(T)', title: 'Managing Partner', bio: '20+ years of experience in corporate taxation and audit for large-scale manufacturing entities.', imageKey: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6RT4t4_La8GLzBpPij-Fg2yLV2lUJcDVn3sQ3wHO0M8eZImuWU8AJvVFljd1ihQv1s4ErJbG-eniqwREwghPhhzY9xZ_YND884uFK-GGI0m0XcFDWwFDeKXx2384CfYcARW_21YZhPDqlTN0X0LbAL4I97Q1lUYt3GAFwSzzvWYfFvf87fOzZ4YaKO-ZMvzcuRss2w7z23LrCUFw8eR9zQ17pL1FOqkm9nhmCxNcNerGnyF9Gp_sUeg' },
		{ name: 'Grace Shirima, ACCA', title: 'Director of Audit', bio: 'Specializes in forensic auditing and compliance for the financial services sector across East Africa.' },
		{ name: 'Daniel Kwayu', title: 'Advisory Lead', bio: 'Expert in M&A restructuring and corporate financial strategy for emerging market enterprises.' },
		{ name: 'Neema Mbowe, CPA(T)', title: 'Head of Tax', bio: 'Advises multinational corporations on cross-border tax implications and local compliance.' },
	]) { const existingMember = await prisma.teamMember.findFirst({ where: { name: member.name } }); if (existingMember) await prisma.teamMember.update({ where: { id: existingMember.id }, data: member }); else await prisma.teamMember.create({ data: member }) }
	const partnerLogos = [
		{ name: 'BRELA', type: 'INSTITUTIONAL', website: 'https://www.brela.go.tz/', imageKey: 'https://www.brela.go.tz/site/images/brela.png', sortOrder: 1 },
		{ name: 'TRA', type: 'INSTITUTIONAL', website: 'https://www.tra.go.tz/', imageKey: 'https://www.tra.go.tz/public/dist/images/LOGO_WINGS.png', sortOrder: 2 },
		{ name: 'BASATA', type: 'INSTITUTIONAL', website: 'https://www.basata.go.tz/', sortOrder: 3 },
		{ name: 'COSOTA', type: 'INSTITUTIONAL', website: 'https://www.cosota.go.tz/', sortOrder: 4 },
		{ name: 'NSSF', type: 'INSTITUTIONAL', website: 'https://www.nssf.or.tz/', sortOrder: 5 },
		{ name: 'TCAA', type: 'INSTITUTIONAL', website: 'https://www.tcaa.go.tz/', sortOrder: 6 },
		{ name: 'TCRA', type: 'INSTITUTIONAL', website: 'https://www.tcra.go.tz/', sortOrder: 7 },
		{ name: 'BOT', type: 'INSTITUTIONAL', website: 'https://www.bot.go.tz/', sortOrder: 8 },
		{ name: 'RITA', type: 'INSTITUTIONAL', website: 'https://www.rita.go.tz/', sortOrder: 9 },
		...['Manufacturing', 'Agriculture', 'Finance', 'Logistics', 'Professional Services'].map((name, index) => ({ name, type: 'CLIENT', sortOrder: index + 1 })),
	]
	for (const partner of partnerLogos) { const existingPartner = await prisma.partnerLogo.findFirst({ where: { name: partner.name, type: partner.type } }); if (!existingPartner) await prisma.partnerLogo.create({ data: partner }) }
}
main().finally(() => prisma.$disconnect())