
import numpy as np
import json

from item.box import Box
from item.cardboard import Cardboard
from item.medicine import Medicine
from item.item import Item


from vehicle.vehicle import create_vehicle
from order.order import Order

#takes in a vehicle.box that contains box and medicine
def vehiclebox_to_dict(vehicle_box):
    vehicle_box_dict = {}
    vehicle_box_dict["type"] = "VehicleContainer"
    vehicle_box_dict["id"] = vehicle_box.id
    vehicle_box_dict["size_x"] = vehicle_box.size[0]
    vehicle_box_dict["size_y"] = vehicle_box.size[1]
    vehicle_box_dict["size_z"] = vehicle_box.size[2]
    vehicle_box_dict["max_weight"] = vehicle_box.max_weight
    vehicle_box_dict["itemList"] = []
    for insertion_order, item in enumerate(vehicle_box.packed_items):
        if isinstance(item, Box):
            vehicle_box_dict["itemList"] += [container_to_dict(item)]

        elif isinstance(item, Item):
            vehicle_box_dict["itemList"] += [item_to_dict(item)]

    return vehicle_box_dict


#takes in a box that contains medicines
def container_to_dict(container):
    container_dict = {}
    container_dict["type"] = "container"
    container_dict["id"] = container.id
    container_dict["size_x"] = container.size[0]
    container_dict["size_y"] = container.size[1]
    container_dict["size_z"] = container.size[2]
    container_dict["max_weight"] = container.max_weight
    container_dict["pos_x"] = container.position[0]
    container_dict["pos_y"] = container.position[1]
    container_dict["pos_z"] = container.position[2]
    container_dict["orderId"] = container.packed_items[0].order_id
    container_dict["itemList"] = []
    for insertion_order, item in enumerate(container.packed_items):
        container_dict["itemList"] += [item_to_dict(item)]
    
    return container_dict
    
#takes in a medicine
def item_to_dict(item):
    item_dict = {}
    item_dict["type"] = "item"
    item_dict["id"] = item.id
    item_dict["size_x"] = item.size[0]
    item_dict["size_y"] = item.size[1]
    item_dict["size_z"] = item.size[2]
    item_dict["weight"] = item.weight
    item_dict["pos_x"] = item.position[0]
    item_dict["pos_y"] = item.position[1]
    item_dict["pos_z"] = item.position[2]
    item_dict["orderId"] = item.order_id

    return item_dict


def json_to_data(json_path):

    containers = []
    vehicles = [] 
    orders = []

    with open(json_path) as f:
        json_data = json.load(f)

        for instance in json_data:

            if instance["type"] == "container":
                size = np.asanyarray([instance["size_x"], instance["size_y"], instance["size_z"]], dtype=np.int64)
                containers.append(Cardboard(instance["id"], "cb_code", "cb_details", size, instance["max_weight"]))

            elif instance["type"] == "order":
                meds = []
                it = 1
                for med in instance["itemList"]:
                    size = np.asanyarray([med["size_x"],med["size_y"],med["size_z"]], dtype=np.int64)
                    medtemp = Medicine(med["id"], str(instance["id"]), str(0), str(med["id"]), it, "grams", size, int(float(med["weight"])), 0, False)
                    #medtemp = Medicine(med.id, str(db_order.id), str(db_order.relation_id), str(med.id), it, med.UOM, size, int(float(med.weight)), TEMP_CLASS[med.delivery_category], med.is_life_saving)
                    it += 1
                    meds.append(medtemp)
                orders.append(Order(instance["id"], 0, meds, (0, 0)))
                #orders.append(Order(db_order.id, db_order.relation_id, meds, (db_customer.latitude, db_customer.longitude)))

            elif instance["type"] == "VehicleContainer":
                vehicles += [create_vehicle("SusunBox", np.asanyarray([instance["size_x"], instance["size_y"], instance["size_z"]], dtype=np.int64), 
                               instance["max_weight"], 1.0, 1.0, 0, 10000000.0, "SusunBoxVehicleType", 1)]
                
    containers = sorted(containers, key=lambda box: box.volume)  
    
    return vehicles, containers, orders
