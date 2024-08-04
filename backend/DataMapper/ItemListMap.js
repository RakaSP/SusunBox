const ItemListMap = ({ ID, Name, SizeX, SizeY, SizeZ, Weight, Priority }) => ({
  id: ID,
  name: Name,
  size_x: SizeX,
  size_y: SizeY,
  size_z: SizeZ,
  weight: Weight,
  priority: Priority,
});

module.exports = ItemListMap;
