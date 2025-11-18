const toggleCategoryListingAjax = async (buttonElement) => {
    const categoryId = buttonElement.getAttribute('data-category-id');
    const isListed = buttonElement.getAttribute('data-is-listed') === 'true';

    const action = isListed ? 'Unlist' : 'List';
    const confirmMessage = `Are you sure you want to ${action} this category?`;
    const successMessage = `Category successfully ${action}ed!`;

    const result = await Swal.fire({
        title: 'Confirm Action',
        text: confirmMessage,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: action === 'Unlist' ? '#dc3545' : '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${action} it!`
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        buttonElement.disabled = true;
        buttonElement.textContent = 'Wait...';

        const response = await fetch('/admin/toggleCategoryListing', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categoryId: categoryId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            const newIsListed = data.isListed;
            
            const toggleButton = document.getElementById(`toggle-btn-${categoryId}`);

            if (newIsListed) {
                toggleButton.textContent = 'Unlist';
                toggleButton.classList.remove('btn-success');
                toggleButton.classList.add('btn-danger');

            } else {
                toggleButton.textContent = 'List';
                toggleButton.classList.remove('btn-danger');
                toggleButton.classList.add('btn-success');
            }

            toggleButton.setAttribute('data-is-listed', newIsListed);

            Swal.fire('Success!', successMessage, 'success');

        } else {
            throw new Error(data.message || 'Failed to update category status.');
        }

    } catch (error) {
        console.error('AJAX Error:', error.message);
        Swal.fire('Error!', error.message || 'Something went wrong on the server.', 'error');
    } finally {
        buttonElement.disabled = false;
        const currentStatus = buttonElement.getAttribute('data-is-listed') === 'true';
        buttonElement.textContent = currentStatus ? 'Unlist' : 'List';
    }
};