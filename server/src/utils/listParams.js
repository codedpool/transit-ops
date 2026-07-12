// Shared parsing for list endpoints: pagination + safe sorting.
// Sort column is whitelisted per module to prevent arbitrary orderBy injection.
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parseListParams(query, { sortable, defaultSort }) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE)
  );

  const sortBy = sortable.includes(query.sortBy) ? query.sortBy : defaultSort;
  const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { [sortBy]: sortDir },
    sortBy,
    sortDir,
  };
}

// Standard paginated envelope returned by every list endpoint.
function paginated(data, total, { page, pageSize }) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

module.exports = { parseListParams, paginated, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE };
