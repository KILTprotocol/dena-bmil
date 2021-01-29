import { PythonShell, Options } from 'python-shell'
// import Kilt from '@kiltprotocol/sdk-js'

/**
 * Generate random
 */
let options: Options = {
  mode: 'text',
  scriptPath: 'scripts',
  args: ['random', '--bytes', '12'],
}

PythonShell.run('zym.py', options, function (err, results) {
  if (err) throw err
  console.log('results:', results)
})

/**
 * Encrypt
 */
options = {
  mode: 'text',
  scriptPath: 'scripts',
  args: ['encrypt', '--out', 'store'],
}

let pyshell = new PythonShell('zym.py', options)

pyshell.send(JSON.stringify({ hello: 'world' }))

pyshell.on('message', function (message) {
  // received a message sent from the Python script (a simple "print" statement)
  console.log(message)
})

// end the input stream and allow the process to exit
pyshell.end(function (err, code, signal) {
  if (err) throw err
  console.log('The exit code was: ' + code)
  console.log('The exit signal was: ' + signal)
  console.log('finished')
})

/**
 * Decrypt
 */
options = {
  mode: 'json',
  scriptPath: 'scripts',
  args: ['decrypt', '--in', 'store'],
}

pyshell = new PythonShell('zym.py', options)

pyshell.on('message', function (message) {
  // received a message sent from the Python script
  console.log(message)
})

// end the input stream and allow the process to exit
pyshell.end(function (err, code, signal) {
  if (err) throw err
  console.log('The exit code was: ' + code)
  console.log('The exit signal was: ' + signal)
  console.log('finished')
})
