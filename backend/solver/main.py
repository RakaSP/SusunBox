from functools import cmp_to_key
from numpyencoder import NumpyEncoder
from arguments import prepare_args
from packing.packing import pack_items_to_box, randomize_rotation, randomize_order, cmp_item_susunbox
from pdfgenerator.pdfgenerator import generate_vehicle_shipment_pdf
from problem import Problem

import json
from my_json.my_json import box_to_dict
# read json
# pack
# return packing/pdf


def run(args):
    problem = Problem(filename=args.filename)
    problem.items = sorted(problem.items, key=cmp_to_key(cmp_item_susunbox))
    problem.box, unpacked_items = pack_items_to_box(problem.box, problem.items)
    # problem.box.visualize_packed_items()
    num_iter = 0
    while len(unpacked_items) > 0 and num_iter < args.max_iter:
        num_iter += 1
        problem.box.reset()
        problem.items = randomize_rotation(problem.items)
        problem.items = randomize_order(problem.items)
        problem.box, unpacked_items = pack_items_to_box(
            problem.box, problem.items)

    result = problem.box
    result = box_to_dict(result)
    with open('results/data_out.json', 'w') as f:
        json.dump(result, f, cls=NumpyEncoder)
    generate_vehicle_shipment_pdf(
        problem.box, "test.pdf", "pdfgenerator/susunbox_logo.png", "SusunBox")


if __name__ == "__main__":
    args = prepare_args()
    run(args)
