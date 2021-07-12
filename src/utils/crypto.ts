import { PythonShell, Options } from 'python-shell'
import fs from 'fs'

const script = process.env.NODE_ENV === 'production' ? 'zym.py' : 'mockzym.py'

/**
 * Generate random
 */
export function generateRandom() {
  const options: Options = {
    mode: 'text',
    scriptPath: 'scripts',
    args: ['random', '--bytes', '32'],
  }

  return new Promise<string>((resolve, reject) => {
    PythonShell.run(script, options, function (err, results) {
      if (err) return reject(err)
      if (!results || typeof results?.[0] !== 'string')
        return reject(new Error('Error while generating random'))
      resolve(results[0])
    })
  })
}

/**
 * Encrypt
 */
export function encryptAndStore(object: Object) {
  const options: Options = {
    mode: 'text',
    scriptPath: 'scripts',
    args: ['encrypt', '--out', 'store'],
  }

  return new Promise<string>((resolve, reject) => {
    const pyshell = new PythonShell(script, options)

    pyshell.send(JSON.stringify(object))

    pyshell.on('message', function (message) {
      console.log(message)
    })

    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
      if (err) return reject(err)
      resolve('ok')
      if (code !== 0) {
        console.log('The exit code was: ' + code)
        console.log('The exit signal was: ' + signal)
        console.log('finished')
      }
    })
  })
}

/**
 * Decrypt
 */
export async function retrieveAndDecrypt() {
  const options: Options = {
    mode: 'text',
    scriptPath: 'scripts',
    args: ['decrypt', '--in', 'store'],
  }

  if (!fs.existsSync('store')) {
    await encryptAndStore({})
  }

  return new Promise<Object>((resolve, reject) => {
    const pyshell = new PythonShell(script, options)

    const messages: Array<string> = []
    pyshell.on('message', function (message) {
      // received a message sent from the Python script
      messages.push(message)
    })

    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
      if (err) return reject(err)
      if (typeof messages[0] !== 'string') {
        return reject(new Error('Error while decrypting and receiving store'))
      }
      const parsed = JSON.parse(messages[0])
      resolve(parsed)
      if (code !== 0) {
        console.log('The exit code was: ' + code)
        console.log('The exit signal was: ' + signal)
        console.log('finished')
      }
    })
  })
}
