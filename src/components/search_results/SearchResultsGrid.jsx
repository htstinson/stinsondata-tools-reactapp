import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';

const SearchResultsGrid = ({ selectedSearchDefinitionEngine, selectedSubscription }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);

  const fetchSearchResults = async () => {
    if (!selectedSearchDefinitionEngine || !selectedSubscription) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Adjust this URL to match your API endpoint for search results
      let url = `https://thousandhillsdigital.net/api/v1/search/${selectedSubscription.subscriber_id}/${selectedSearchDefinitionEngine.id}`;
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setData(jsonData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [selectedSearchDefinitionEngine, sort, selectedSubscription]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  if (!selectedSearchDefinitionEngine) {
    return (
      <div className="px-4 sm:px-0 mt-8">
        <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-600">Please select a search definition engine to view results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 mt-8">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Search Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing results for: {selectedSearchDefinitionEngine.search_definition_name} - {selectedSearchDefinitionEngine.search_engine_name}
          </p>
        </div>
        <Button onClick={fetchSearchResults} themeColor="light">Refresh</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading search results...</div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error loading search results: {error}</p>
          <button 
            onClick={fetchSearchResults}
            className="mt-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-600">No search results found</p>
        </div>
      ) : (
        <Grid
          data={data}
          style={{ height: '500px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50, 100],
            pageSize: 20
          }}
        >
          {/* Adjust these columns based on your actual search results data structure */}
          
          <GridColumn field="title" title="Title" />
          <GridColumn field="link" title="URL" 
            cell={(props) => (
            <td>
            <a 
                href={props.dataItem.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
            >
                {props.dataItem.link}
            </a>
            </td>
            )} />
          <GridColumn field="snippet" title="Snippet" />
          <GridColumn field="published" title="Published" width="100px"
            cell={(props) => ( <td>{new Date(props.dataItem.published).toLocaleDateString()}</td> )} />
          <GridColumn 
            field="search_time" 
            title="Search Date" 
            width="150px"
            cell={(props) => (
              <td>{new Date(props.dataItem.search_time).toLocaleDateString()}</td>
            )}
          />
        </Grid>
      )}
    </div>
  );
};

export default SearchResultsGrid;