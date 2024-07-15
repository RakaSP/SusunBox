import json

from numpyencoder import NumpyEncoder

from pdfgenerator.pdfgenerator import PDF

from my_json.my_json import json_to_data, vehiclebox_to_dict

from vns.saving import saving
from vns.repack import repack
from vns.route_dp import improve_tours_by_dp
from vrp3d.vrp3d import VRP3D

from pdfgenerator.pdfgenerator import generate_vehicle_shipment_pdf


def run():

    vehicle_list, cbox_type_list, order_list = json_to_data("data (5).json")

    for i, order in enumerate(order_list):
        print("Packing order ", i, " into cardboxes")
        order_list[i].pack_items_into_cardboard_boxes(cbox_type_list)

    # problem = VRP3D(vehicle_list,
    #                 order_list,
    #                 depot_coord,
    #                 1)

    problem = VRP3D(vehicle_list,
                    order_list,
                    (0.0, 0.0),
                    1)
    print("START SOLUTION GENERATION")

    solution = saving(problem)
    problem.reset(solution)

    solution = improve_tours_by_dp(solution, problem)
    problem.reset(solution)

    vec = problem.vehicle_list[0]
    vec_box = vec.box

    result = vehiclebox_to_dict(vec_box)
    print(type(result))
    print(result)
    with open('data_out.json', 'w') as f:
        json.dump(result, f, cls=NumpyEncoder)

    generate_vehicle_shipment_pdf(
        vec_box, "test.pdf", "pdfgenerator/susunbox_logo.png", "SusunBox")


if __name__ == "__main__":
    # seed(datetime.datetime.now().timestamp())

    run()
