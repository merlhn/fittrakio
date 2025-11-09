import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create Egemen Başar
  const egemenPassword = 'Egemen2025!'
  const egemenHashed = await hashPassword(egemenPassword)
  
  const egemen = await prisma.user.upsert({
    where: { email: 'i.egemenbasar@gmail.com' },
    update: {},
    create: {
      name: 'Egemen Başar',
      email: 'i.egemenbasar@gmail.com',
      password: egemenHashed,
    },
  })

  console.log('Egemen Başar created:')
  console.log('Email: i.egemenbasar@gmail.com')
  console.log('Password: Egemen2025!')
  console.log('---')

  // Create Bayram Çakır
  const bayramPassword = 'Bayram2025!'
  const bayramHashed = await hashPassword(bayramPassword)
  
  const bayram = await prisma.user.upsert({
    where: { email: 'bayramcakir1992@gmail.com' },
    update: {},
    create: {
      name: 'Bayram Çakır',
      email: 'bayramcakir1992@gmail.com',
      password: bayramHashed,
    },
  })

  console.log('Bayram Çakır created:')
  console.log('Email: bayramcakir1992@gmail.com')
  console.log('Password: Bayram2025!')
  console.log('---')

  console.log('Users created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

