// 启动一个服务
import { createServer } from 'node:http'
// import { createNitro } from 'nitro'imimport { resolve } from 'node:path'
import { H3, eventHandler, serveStatic, serve } from 'h3'
import { fileURLToPath } from 'node:url'
import { join } from 'pathe'
import { readFile, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { lookup } from 'mrmime';
const distDir = fileURLToPath(new URL('../dist/public', import.meta.url))
const createHostServer = () => {
  const app = new H3()
  app.use('/**', eventHandler(async (event) => {
    // const requestUrl = event.req.url
    const result = await serveStatic(event, {
      fallthrough: true,
      getContents: id => {
        console.log(id,'id')
        // return readFileSync(join(distDir, 'index.html'), 'utf-8')
        return readFile(join(distDir, id))
      },
      getMeta: async (id) => {
        const stats = await stat(join(distDir, id)).catch(() => { })
        // console.log(lookup(id), 'id',id)
        if (!stats || !stats.isFile()) return

        return {
          type: lookup(id),
          size: stats.size,
          mtime: stats.mtimeMs,
        }
        // return {}
      },
    })
  
    if (!result) {
      // 设置头
      event.res.headers.set("Content-Type", "text/html;charset=UTF-8");
      //  返回join(distDir, 'index.html')的内容
      return readFileSync(join(distDir, 'index.html'), 'utf-8')
    }else {
      return result
    }
  })

  )
  app.get('/message', eventHandler(() => {
    console.log('message')
    return {
      message: 'hello world'
    }
  }))
  serve(app, { port: 3000 });
}

export {
  createHostServer
}
