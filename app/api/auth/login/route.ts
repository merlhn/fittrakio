import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    
    const { email, password } = await request.json()
    console.log('Login request received:', { email, hasPassword: !!password })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Checking JWT_SECRET:', { hasJWTSecret: !!process.env.JWT_SECRET })
    
    console.log('Fetching user from database...')
    const user = await prisma.user.findUnique({
      where: { email },
    })
    console.log('User found:', { found: !!user, userId: user?.id })

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Email or password is incorrect' },
        { status: 401 }
      )
    }

    console.log('Comparing password...')
    const isValidPassword = await comparePassword(password, user.password)
    console.log('Password comparison result:', isValidPassword)

    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Email or password is incorrect' },
        { status: 401 }
      )
    }

    console.log('Generating token...')
    const token = generateToken({
      userId: user.id,
      email: user.email,
    })
    console.log('Token generated successfully')

    console.log('Setting cookie...')
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    console.log('Cookie set successfully')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error('Login error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    })
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'An error occurred during login'
      : 'An error occurred during login'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

