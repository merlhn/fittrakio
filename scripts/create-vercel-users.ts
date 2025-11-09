import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('Creating users in Vercel database...\n')

  // Create Ömer İlhan
  const omerPassword = 'Omer2025!'
  const omerHashed = await hashPassword(omerPassword)
  
  const omer = await prisma.user.upsert({
    where: { email: 'omerlhn@gmail.com' },
    update: {},
    create: {
      name: 'Ömer İlhan',
      email: 'omerlhn@gmail.com',
      password: omerHashed,
    },
  })

  console.log('✅ Ömer İlhan created/updated:')
  console.log('   Email: omerlhn@gmail.com')
  console.log('   Password: Omer2025!')
  console.log('---')

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

  console.log('✅ Egemen Başar created/updated:')
  console.log('   Email: i.egemenbasar@gmail.com')
  console.log('   Password: Egemen2025!')
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

  console.log('✅ Bayram Çakır created/updated:')
  console.log('   Email: bayramcakir1992@gmail.com')
  console.log('   Password: Bayram2025!')
  console.log('---')

  console.log('\n✅ All users created successfully!')
  console.log('\nYou can now login with any of these accounts.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

