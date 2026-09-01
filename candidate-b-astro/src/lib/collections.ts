type WithOrder = { data: { order: number } };
/**

* Порядок, в котором getCollection() возвращает записи,
* не гарантирован и зависит от файловой системы.
* Поэтому каждый список сортируется явно.
*/
export function byOrder<T extends WithOrder>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}
