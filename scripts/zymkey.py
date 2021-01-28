import argparse

if __name__ == "__main__":

    def random(args):
      print(args)

    def encrypt(args):
      print(args)

    def decrypt(args):
      print(args)

    # Create Parser
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers()
    random_parser = subparsers.add_parser(
        "random", help="generate a random hex string and print to stdout")
    random_parser.add_argument(
        '--bytes', '-b', help="Amount of bytes to be generated", default=512)
    random_parser.set_defaults(func=random)

    encrypt_parser = subparsers.add_parser(
        "encrypt", help="encrypt json data from stdin and store to file")
    encrypt_parser.add_argument(
        '--out', '-o', help="file to store to", required=True, dest="file")
    encrypt_parser.set_defaults(func=encrypt)

    decrypt_parser = subparsers.add_parser(
        "decrypt", help="decrypt encrypted file and print to stdout")
    decrypt_parser.add_argument(
        '--in', '-i', help="encrypted file to read from", required=True, dest="file")
    decrypt_parser.set_defaults(func=decrypt)

    # Read args from cli
    args = parser.parse_args()
    args.func(args)