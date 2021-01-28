import zymkey

num = 512
random = zymkey.client.get_random(num)
s = random.hex()
print(s)