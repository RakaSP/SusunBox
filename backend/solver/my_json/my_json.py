import numpy as np
import json

from item.box import Box
from item.cardboard import Cardboard
from item.medicine import Medicine
from item.item import Item

# takes in a vehicle.box that contains box and medicine


def box_to_dict(box):
    box_dict = {}
    box_dict["Type"] = "VehicleContainer"
    box_dict["ID"] = box.id
    box_dict["SizeX"] = box.size[0]
    box_dict["SizeY"] = box.size[1]
    box_dict["SizeZ"] = box.size[2]
    box_dict["MaxWeight"] = box.max_weight
    box_dict["ItemList"] = []
    for insertion_order, item in enumerate(box.packed_items):
        if isinstance(item, Box):
            box_dict["ItemList"] += [container_to_dict(item)]

        elif isinstance(item, Item):
            box_dict["ItemList"] += [item_to_dict(item)]

    return box_dict


# takes in a box that contains medicines
def container_to_dict(container):
    container_dict = {}
    container_dict["Type"] = "Container"
    container_dict["ID"] = container.id
    container_dict["SizeX"] = container.size[0]
    container_dict["SizeY"] = container.size[1]
    container_dict["SizeZ"] = container.size[2]
    container_dict["MaxWeight"] = container.max_weight
    container_dict["PosX"] = container.position[0]
    container_dict["PosY"] = container.position[1]
    container_dict["PosZ"] = container.position[2]
    container_dict["OrderID"] = container.packed_items[0].order_id
    container_dict["ItemList"] = []
    for insertion_order, item in enumerate(container.packed_items):
        container_dict["ItemList"] += [item_to_dict(item)]

    return container_dict

# takes in a medicine


def item_to_dict(item):
    item_dict = {}
    item_dict["Type"] = "Item"
    item_dict["ID"] = item.id
    item_dict["SizeX"] = item.size[0]
    item_dict["SizeY"] = item.size[1]
    item_dict["SizeZ"] = item.size[2]
    item_dict["Weight"] = item.weight
    item_dict["PosX"] = item.position[0]
    item_dict["PosY"] = item.position[1]
    item_dict["PosZ"] = item.position[2]

    return item_dict
