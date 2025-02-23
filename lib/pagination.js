// Helper function for pagination
function pagination(data, limit, page) {
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const index = (currentPage - 1) * itemsPerPage;

    return { totalPages, index };
}

module.exports = { pagination };