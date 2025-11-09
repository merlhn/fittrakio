import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  return payload
}

