import argparse
import sys

def prepare_args():
    parser = argparse.ArgumentParser(description='susunbox')
    parser.add_argument('--filename',
                        type=str,
                        default="example.json",
                        help="input json filename")
    parser.add_argument('--max-iter',
                        type=int,
                        default=1000,
                        help="Max iteration of finding appropriate packing")
    args = parser.parse_args(sys.argv[1:])
    return args
    