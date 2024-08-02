from copy import copy, deepcopy
from functools import cmp_to_key
from math import ceil
from typing import Dict, List, Tuple
from random import randint

import numpy as np

from item.item import Item
from item.susun_item import SusunItem
from item.box import Box


"""
sort item first by their packing order (LIFO),
if same order, then:
this sorting simply sort non-increasingly
by area, then height as tiebreaker also non-increasing
"""
def cmp_item_susunbox(item1:SusunItem, item2:SusunItem):
    if item1.priority < item2.priority:
        return -1
    if item1.priority > item2.priority:
        return 1
    if item1.face_area < item2.face_area:
        return 1
    if item1.face_area > item2.face_area:
        return -1
    if item1.size[2]< item2.size[2]:
        return 1
    if item1.size[2]> item2.size[2]:
        return -1
    return 0


def find_first_ep(box_list: List[Box], item:Item):
    for bi, box in enumerate(box_list):
        for ei, ep in enumerate(box.ep_list): 
            if not box.is_insert_feasible(ep, item):
                continue
            return bi, ei
    return -1, -1

def randomize_rotation(items: List[Item]) -> List[Item]:
    for item in items:
        r = randint(0,100)
        if r < 40:
            a = randint(0,5)
            b = randint(0,5)
            item.alternative_sizes[[a,b]] = item.alternative_sizes[[b,a]]
    return items

def randomize_order(items: List[Item], num_swaps=10) -> List[Item]:
    for _ in range(num_swaps):
        a = randint(0, len(items)-1)
        b = randint(0, len(items)-1)
        r = randint(0,100)
        if items[a].priority == items[b].priority and r<50:
            items[a], items[b] = items[b], items[a]
            
    return items

def pack_items_to_box(box: Box, item_list: List[Item]) -> Tuple[Box, List[Item]]:
    unpacked_items = []
    for item in item_list:
        is_inserted = False
        for rc in range(6):
            item.rotate_count = rc
            box_i, ep_i = find_first_ep([box], item)
            if ep_i != -1:
                is_inserted = True
                box.insert(ep_i, item)
                break
        if not is_inserted:
            unpacked_items += [item]
            continue
            
    return box, unpacked_items

def get_items_too_big_idx(item_list:List[Item], box_type_list:List[Box]):
    item_sizes = []
    for i, item in enumerate(item_list):
        item_i_sizes = [item_list[i].alternative_sizes[r,:][np.newaxis,:] for r in range(6)]
        item_i_sizes = np.concatenate(item_i_sizes, axis=0)
        item_sizes += [item_i_sizes[np.newaxis,:,:]]
    item_sizes = np.concatenate(item_sizes,axis=0)
    box_sizes = np.concatenate([box.size[np.newaxis,:] for box in box_type_list])
    item_sizes = item_sizes[:,:,np.newaxis,:]
    box_sizes = box_sizes[np.newaxis,np.newaxis,:,:]
    is_bigger = item_sizes>box_sizes
    is_any_dim_bigger = np.any(is_bigger,axis=-1)
    is_all_rotation_bigger = np.all(is_any_dim_bigger,axis=1)
    is_gt_all_box = np.all(is_all_rotation_bigger,axis=1)
    is_gt_idx = np.nonzero(is_gt_all_box)[0]
    return is_gt_idx

        
