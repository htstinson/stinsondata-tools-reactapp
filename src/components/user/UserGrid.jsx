import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { UserForm } from './UserForm';

const PAGE_SIZES = [10, 20, 50];

const UserGrid = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [page, setPage] = useState({ skip: 0, take: PAGE_SIZES[0] });
  const [editUser, setEditUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);

  const fetchData = async () => {
    try {
      data.length === 0 ? setLoading(true) : setFetching(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const pageNumber = Math.floor(page.skip / page.take) + 1;

      const params = new URLSearchParams({
        page: pageNumber,
        limit: page.take,
      });
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }
      if (dateFilter) {
        params.append('date', dateFilter.toISOString());
      }

      const response = await fetch(
        `https://thousandhillsdigital.net/api/v1/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token'); // was removeUser — bug fix
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      // Expect the API to return { users: [...], total: N }
      setData(json.users ?? json);
      setTotal(json.total ?? json.length);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sort, page, dateFilter]);

  const handleSortChange = (e) => {
    setPage((p) => ({ ...p, skip: 0 })); // reset to first page on sort
    setSort(e.sort);
  };

  const handlePageChange = (e) => {
    setPage({ skip: e.page.skip, take: e.page.take });
  };

  const handleEdit = (dataItem) => {
    setEditUser(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditUser(null);
    setShowDialog(true);
  };

  const handleSubmit = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const method = user.id ? 'PUT' : 'POST';
      const url = user.id
        ? `https://thousandhillsdigital.net/api/v1/users/${user.id}`
        : 'https://thousandhillsdigital.net/api/v1/users';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setShowDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (dataItem) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://thousandhillsdigital.net/api/v1/users/${dataItem.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const ActionCell = (props) => (
    <td>
      <div className="flex space-x-2">
        <Button onClick={() => handleEdit(props.dataItem)} themeColor="info" size="small">
          Edit
        </Button>
        <Button onClick={() => handleDelete(props.dataItem)} themeColor="error" size="small">
          Delete
        </Button>
      </div>
    </td>
  );

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreate} themeColor="primary">Create New User</Button>
          <Button onClick={fetchData} themeColor="light">Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error loading data: {error}</p>
          <button
            onClick={fetchData}
            className="mt-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="relative">
          {fetching && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded">
              <div className="text-gray-500 text-sm">Loading...</div>
            </div>
          )}
        <Grid
          data={data}
          total={total}
          style={{ height: '400px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          pageable={{ buttonCount: 5, pageSizes: PAGE_SIZES }}
          skip={page.skip}
          take={page.take}
          onPageChange={handlePageChange}
        >
          <GridColumn field="username" title="Name" />
          <GridColumn field="ip_address" title="IP Address" />
          <GridColumn title="Actions" cell={ActionCell} width="200px" />
        </Grid>
        </div>
      )}

      {showDialog && (
        <Dialog
          title={editUser ? 'Edit User' : 'Create New User'}
          onClose={() => setShowDialog(false)}
        >
          <UserForm
            user={editUser}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default UserGrid;