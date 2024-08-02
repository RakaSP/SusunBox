from numpy import ndarray

from item.item import Item


class SusunItem(Item):
    def __init__(self, 
                 id: int, 
                 size: ndarray, 
                 name: str,
                 weight: float,
                 priority: int):
        super().__init__(id, size, name)
        self.weight = weight
        self.priority = priority