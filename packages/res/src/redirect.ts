import { IncomingMessage as I, ServerResponse as S, STATUS_CODES } from 'http'
import escapeHtml from 'escape-html'
import { formatResponse } from './format'
import { setLocationHeader } from './headers'

type Req = Pick<I, 'headers' | 'method'>

export type Res = Pick<S, 'setHeader' | 'statusCode' | 'getHeader' | 'end'>

type next = (err?: any) => void

export const redirect =
  <Request extends Req = Req, Response extends Res = Res, Next extends next = next>(
    req: Request,
    res: Response,
    next: Next
  ) =>
  (url: string, status?: number) => {
    let address = url
    status = status || 302

    let body = ''

    address = setLocationHeader(req, res)(address).getHeader('Location') as string

    formatResponse(
      req,
      res,
      next
    )({
      text: () => {
        body = STATUS_CODES[status] + '. Redirecting to ' + address
      },
      html: () => {
        const u = escapeHtml(address)

        body = `<p>${STATUS_CODES[status]}. Redirecting to <a href="${u}">${u}</a></p>`
      }
    })

    res.setHeader('Content-Length', Buffer.byteLength(body))

    res.statusCode = status

    if (req.method === 'HEAD') res.end()
    else res.end(body)

    return res
  }
