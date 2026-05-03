import { getMailer } from '../config/mailer'

function maskEmailForLog(email: string) {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '[invalid]'
  if (local.length <= 2) return `${local[0] ?? '*'}*@${domain}`
  return `${local.slice(0, 2)}***@${domain}`
}

/** Structured logs for production SMTP debugging — never logs passwords or full verification tokens. */
export const sendVerificationEmail = async (email: string, token: string) => {
  const trimmedEmail = email.trim()
  const maskedTo = maskEmailForLog(trimmedEmail)
  const from = process.env.MAIL_FROM
  const hasFrontendUrl = Boolean(process.env.FRONTEND_URL?.trim())

  console.log('[mail] verification:start', {
    to: maskedTo,
    hasFrom: Boolean(from?.trim()),
    hasFrontendUrl,
    verifyPath: hasFrontendUrl ? 'frontend /verify-email' : 'backend /api/auth/verify-email',
    tokenLen: token.length,
  })

  if (!from?.trim()) {
    console.error('[mail] verification:abort — MAIL_FROM is missing or empty')
    throw new Error('MAIL_FROM is not configured')
  }

  const transporter = await getMailer()
  const frontendUrl = process.env.FRONTEND_URL
  const verifyUrl = frontendUrl
    ? `${frontendUrl.replace(/\/$/, '')}/verify-email?token=${token}`
    : `http://localhost:${process.env.PORT || 5000}/api/auth/verify-email?token=${token}`

  try {
    const info = await transporter.sendMail({
      from,
      to: trimmedEmail,
      subject: 'Verify your Blockvote account',
      html: `
      <h2>Welcome to Blockvote</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}" style="
        background:#00d4c8;
        color:black;
        padding:12px 24px;
        border-radius:8px;
        text-decoration:none;
        font-weight:bold;
      ">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
    })

    console.log('[mail] verification:sent', {
      to: maskedTo,
      messageId: info.messageId ?? null,
      accepted: info.accepted ?? null,
      rejected: info.rejected ?? null,
      pending: info.pending ?? null,
      response: typeof info.response === 'string' ? info.response.slice(0, 300) : info.response ?? null,
    })
  } catch (err) {
    const e = err as Record<string, unknown> & {
      message?: string
      name?: string
      code?: string
      errno?: number
      syscall?: string
      command?: string
      response?: string
      responseCode?: number
    }
    console.error('[mail] verification:failed', {
      to: maskedTo,
      message: e.message,
      name: e.name,
      code: e.code,
      errno: e.errno,
      syscall: e.syscall,
      address: typeof e.address === 'string' ? e.address : undefined,
      port: typeof e.port === 'number' ? e.port : undefined,
      command: e.command,
      responseCode: e.responseCode,
      response:
        typeof e.response === 'string' ? e.response.slice(0, 500) : e.response ?? undefined,
    })
    throw err
  }
}
