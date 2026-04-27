import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { listInventory } from '../../lib/api/inventory';
import '../common.css';

export function InventoryListPage() {
  const [search, setSearch] = useState('');
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => listInventory(),
  });

  const filtered = items.filter((i: any) =>
    i.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    i.itemCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1>Inventory</h1>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
          style={{ maxWidth: '300px' }}
        />
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
