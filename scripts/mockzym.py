#!/usr/bin/env python3

import argparse
import pathlib
import sys
import secrets


def random_func(args):
    random = secrets.token_bytes(args.bytes)
    s = random.hex()
    print(s)


def encrypt_func(args):
    data = sys.stdin.buffer.read()
    with open(str(args.file), 'wb') as f:
        f.write(data)
    print("OK")


def decrypt_func(args):
    with open(str(args.file), 'rb') as f:
        data = f.read()
        sys.stdout.buffer.write(data)

if __name__ == "__main__":

    # Create Parser
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers()
    random_parser = subparsers.add_parser(
        "random", help="generate a random hex string and print to stdout")
    random_parser.add_argument(
        '--bytes', '-b', help="Amount of bytes to be generated", type=int, default=512)
    random_parser.set_defaults(func=random_func)

    encrypt_parser = subparsers.add_parser(
        "encrypt", help="encrypt data from stdin and store to file")
    encrypt_parser.add_argument(
        '--out', '-o', help="file to store to", required=True, type=pathlib.Path, dest="file")
    encrypt_parser.set_defaults(func=encrypt_func)

    decrypt_parser = subparsers.add_parser(
        "decrypt", help="decrypt encrypted file and print to stdout")
    decrypt_parser.add_argument(
        '--in', '-i', help="encrypted file to read from", type=pathlib.Path, required=True, dest="file")
    decrypt_parser.set_defaults(func=decrypt_func)

    # Read args from cli
    args = parser.parse_args()
    args.func(args)
