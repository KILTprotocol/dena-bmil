import { PythonShell, Options } from 'python-shell'
import Kilt from '@kiltprotocol/sdk-js'

let options = {
  mode: 'json',
  scriptPath: 'scripts',
  args: [],
}

PythonShell.run('zym.py', options, function (err) {
  if (err) throw err
  console.log('results: %j', results)
})
