import nodemailer from 'nodemailer'

const forceIpv4 =
  process.env.MAIL_FORCE_IPV4?.trim().toLowerCase() === 'true' ||
  process.env.MAIL_FORCE_IPV4 === '1'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  ...(forceIpv4 ? { family: 4 as const } : {}),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

export default transporter
