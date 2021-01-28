import zymkey
from pathlib import Path

filepath = Path.cwd() / 'hello_world'
filedest = Path.cwd() / 'hello_world2'

zymkey.client.lock(str(filepath), str(filedest))