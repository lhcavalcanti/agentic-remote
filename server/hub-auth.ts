import { createHmac, timingSafeEqual } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'

function equal(left: string, right: string): boolean {
  const actual = Buffer.from(left)
  const expected = Buffer.from(right)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

export function createHubAuthHook(username: string, password: string) {
  const sessionToken = createHmac('sha256', password)
    .update('agentic-remote-hub-session')
    .digest('base64url')
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (
      request.url === '/health' ||
      request.url.startsWith('/node-api/') ||
      request.url === '/node-api'
    ) {
      return
    }
    const cookies = new Map(
      (request.headers.cookie || '').split(';').flatMap((entry) => {
        const separator = entry.indexOf('=')
        return separator > 0
          ? [[entry.slice(0, separator).trim(), entry.slice(separator + 1).trim()]]
          : []
      }),
    )
    if (equal(cookies.get('agentic_remote_auth') || '', sessionToken)) {
      return
    }
    const authorization = request.headers.authorization
    if (!authorization?.startsWith('Basic ')) {
      return reply
        .header('www-authenticate', 'Basic realm="Agentic Remote"')
        .code(401)
        .send({ error: 'Hub authentication required' })
    }
    let decoded = ''
    try {
      decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
    } catch {
      decoded = ''
    }
    const separator = decoded.indexOf(':')
    const actualUser = separator >= 0 ? decoded.slice(0, separator) : ''
    const actualPassword = separator >= 0 ? decoded.slice(separator + 1) : ''
    if (!equal(actualUser, username) || !equal(actualPassword, password)) {
      return reply
        .header('www-authenticate', 'Basic realm="Agentic Remote"')
        .code(401)
        .send({ error: 'Invalid hub credentials' })
    }
    const secure = request.protocol === 'https' ? '; Secure' : ''
    reply.header(
      'set-cookie',
      `agentic_remote_auth=${sessionToken}; HttpOnly; SameSite=Strict; Path=/${secure}`,
    )
  }
}
