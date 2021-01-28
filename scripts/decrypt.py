import zymkey
from pathlib import Path

file_in = Path.cwd() / 'hello_world2'
file_out = Path.cwd() / 'hello_world3'

zymkey.client.unlock(str(file_in), str(file_out))