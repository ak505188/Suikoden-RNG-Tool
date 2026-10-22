/** An item's display name, with its quantity for stacks ("Mega medicine x3"); '' for no item. */
export const itemName = (item) =>
  item ? `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}` : '';
