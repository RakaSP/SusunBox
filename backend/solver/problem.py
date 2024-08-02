import json
import pathlib
from typing import List, Tuple

import numpy as np

from item.box import Box
from item.susun_item import SusunItem


class Problem:
    def __init__(self,
                 box: Box=None,
                 items: List[SusunItem]=None,
                 filename: str=None) -> None:
        self.box = box
        self.items = items
        if filename is not None:
            self.box, self.items = read_from_file(filename)
            
def read_from_file(filename:str)->Tuple[Box, List[SusunItem]]:
    filedir = pathlib.Path()/"instances"
    filedir.mkdir(parents=True, exist_ok=True)
    filepath = filedir/filename
    with open(filepath.absolute(), "r") as f:
        data = json.load(f)
    box:Box = None
    items:List[SusunItem] = []
    for key, val in data.items():
        if key == "box":
            size = np.asanyarray([val["size_x"], val["size_y"], val["size_z"]])
            box = Box(0, size, val["max_weight"], "Box", 0.8)
            continue

        for item_data in val:
            size = np.asanyarray([item_data["size_x"], item_data["size_y"], item_data["size_z"]])
            item = SusunItem(len(items), size, "item", item_data["weight"],  item_data["priority"])
            items += [item]
    return box, items
        