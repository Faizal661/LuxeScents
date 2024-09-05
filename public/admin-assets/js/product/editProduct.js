let removedImages = []
function handleFormSubmit(event) {
    event.preventDefault();


    if (!validateForm()) {
        console.log("Form validation failed");
        return;
    }

    const formData = new FormData();
    const formElements = event.target.elements;

    formData.append('productName', formElements['productName'].value.trim());
    formData.append('description', formElements['description'].value);
    formData.append('gender', formElements['gender'].value);
    formData.append('status', formElements['status'].value);
    formData.append('brands', formElements['brands'].value);
    formData.append('category', formElements['category'].value);

    const variationItems = document.querySelectorAll('.variation-item');
    variationItems.forEach((item, index) => {
        const size = item.querySelector(`[name="variations[${index}][size]"]`).value;
        const quantity = item.querySelector(`[name="variations[${index}][quantity]"]`).value;
        const regularPrice = item.querySelector(`[name="variations[${index}][regularPrice]"]`).value;
        const salePrice = item.querySelector(`[name="variations[${index}][salePrice]"]`).value;

        // Append each field separately for each variation
        formData.append(`variations[${index}][size]`, size);
        formData.append(`variations[${index}][quantity]`, quantity);
        formData.append(`variations[${index}][regularPrice]`, regularPrice);
        formData.append(`variations[${index}][salePrice]`, salePrice);
    });

    const existingImages = document.getElementsByName('existingImages');
    for (let i = 0; i < existingImages.length; i++) {
        formData.append('existingImages', existingImages[i].value);
    }

    console.log(removedImages);
    for (let i = 0; i < removedImages.length; i++) {
        formData.append('removedImages', removedImages[i]);
    }

    const files = formElements['productImages'].files;
    for (let i = 0; i < files.length; i++) {
        formData.append('productImages', files[i]);
    }


    fetch(`/admin/editProduct/${productId}`, {
        method: 'POST',
        body: formData

    })
        .then(async response => {
            if (response.ok) {
                const data = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: "Success",
                    text: "product Updated successfully",
                    timer: 2000
                }).then(() => {
                    window.location.href = "/admin/products";
                });
            } else {
                const err = await response.json();
                throw new Error(err.error);
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: "Oops",
                text: error.message || "An error occurred while updating the product"
            });
        });


}


// varaitions management in add productt

let variationCount = parseInt(document.getElementById('total-variations').textContent)
const maxVariations = 5;

document.getElementById('add-variation-btn').addEventListener('click', function () {
    if (variationCount >= maxVariations) {
        Swal.fire({
            icon: 'error',
            title: 'Limit Reached',
            text: 'You can only add a maximum of 5 variations.',
        });
        return;
    }
    const container = document.getElementById('variations-container');

    const newVariation = document.createElement('div');
    newVariation.classList.add('variation-item', 'mt-3');
    newVariation.innerHTML = `
        <div class="row">
            <div class="text-end mt-2">
            <button type="button" class="btn btn-danger remove-variation-btn">X</button>
        </div>
            <div class="col-md-2 ms-5">
                <label class="form-label">Size</label>
                <select name="variations[${variationCount}][size]" class="form-select shadow form-control">
                    <option value="25ml">25ml</option>
                    <option value="50ml">50ml</option>
                    <option value="75ml">75ml</option>
                    <option value="100ml">100ml</option>
                    <option value="150ml">150ml</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Quantity</label>
                <input type="number" name="variations[${variationCount}][quantity]" placeholder="Type here" class="form-control shadow" id="variation-${variationCount}-quantity" />
                <div id="variation-${variationCount}-quantity-error" class="error-message"></div>
            </div>
            <div class="col-md-2">
                <label class="form-label">Regular Price</label>
                <input type="number" name="variations[${variationCount}][regularPrice]" placeholder="Type here" class="form-control shadow" id="variation-${variationCount}-regularPrice"/>
                <div id="variation-${variationCount}-regularPrice-error" class="error-message"></div>
            </div>
            <div class="col-md-2">
                <label class="form-label">Sale Price</label>
                <input type="number" name="variations[${variationCount}][salePrice]" placeholder="Type here" class="form-control shadow" id="variation-${variationCount}-salePrice"/>
                <div id="variation-${variationCount}-salePrice-error" class="error-message"></div>
            </div>
        </div>
        <hr>
    `;
    container.appendChild(newVariation);
    variationCount++;

    newVariation.querySelector('.remove-variation-btn').addEventListener('click', function () {
        newVariation.remove();
        variationCount--;
    });
});


function validateForm() {
    clearErrorMessage();
    const name = document.getElementsByName("productName")[0].value.trim();
    const description = document.getElementById("descriptionId").value.trim();

    const files = document.getElementById('productImages').files;
    console.log('existing Images', document.getElementById('existingImages').value)
    const existingImages = JSON.parse(document.getElementById('existingImages').value);


    let isValid = true;

    if (name == "") {
        displayErrorMessage("name-error", "Please enter a name")
        isValid = false

    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        displayErrorMessage("name-error", "Product name should contain only aplphabetic characters")
        isValid = false
    }

    if (description == "") {
        displayErrorMessage("description-error", "Please enter a description")
        isValid = false
    }

    if (existingImages.length + files.length < 4) {
        displayErrorMessage("images-error", "Please select at least 4 product images");
        isValid = false;
    } else if (existingImages.length + files.length > 10) {
        displayErrorMessage("images-error", "You can only select at most 10 product images");
        isValid = false;
    }

    const variationItems = document.querySelectorAll('.variation-item');
    variationItems.forEach((item, index) => {
        const quantityInput = item.querySelector(`[name="variations[${index}][quantity]"]`).value.trim();
        const regularPriceInput = item.querySelector(`[name="variations[${index}][regularPrice]"]`).value.trim();
        const salePriceInput = item.querySelector(`[name="variations[${index}][salePrice]"]`).value.trim();

        const quantity = quantityInput === "" ? NaN : parseFloat(quantityInput);
        const regularPrice = regularPriceInput === "" ? NaN : parseFloat(regularPriceInput);
        const salePrice = salePriceInput === "" ? NaN : parseFloat(salePriceInput);

        if (isNaN(quantity)) {
            displayErrorMessage(`variation-${index}-quantity-error`, "Please enter the stock of the product");
            isValid = false;
        } else if (quantity < 0) {
            displayErrorMessage(`variation-${index}-quantity-error`, "Stock quantity can't be a negative value");
            isValid = false;
        }

        if (isNaN(regularPrice)) {
            displayErrorMessage(`variation-${index}-regularPrice-error`, "Please enter Regular Price");
            isValid = false;
        } else if (regularPrice <= 0) {
            displayErrorMessage(`variation-${index}-regularPrice-error`, "Regular Price can't be a negative value or zero");
            isValid = false;
        }

        if (isNaN(salePrice)) {
            displayErrorMessage(`variation-${index}-salePrice-error`, "Please enter Sale Price");
            isValid = false;
        } else if (salePrice <= 0) {
            displayErrorMessage(`variation-${index}-salePrice-error`, "Sale Price can't be a negative value or zero");
            isValid = false;
        } else if (salePrice > regularPrice) {
            displayErrorMessage(`variation-${index}-salePrice-error`, "Sale Price must be lower than the regular price");
            isValid = false;
        }
    });


    return isValid;
}


function displayErrorMessage(elementId, message) {
    var errorElement = document.getElementById(elementId)
    errorElement.innerText = message;
    errorElement.style.display = "block";
}

function clearErrorMessage() {
    var errorElements = document.getElementsByClassName("error-message")
    Array.from(errorElements).forEach((element) => {
        element.innerText = "";
        element.style.display = "none"
    })

}


function removeExistingImage(imagePath, index) {
    const existingImages = JSON.parse(document.getElementById('existingImages').value);

    // Add the removed image path to a hidden input
    const removedImagesInput = document.getElementById('removedImages');
    const removedImages = removedImagesInput.value ? JSON.parse(removedImagesInput.value) : [];
    removedImages.push(imagePath);
    removedImagesInput.value = JSON.stringify(removedImages);

    // Update the existing images array and hidden input
    existingImages.splice(index, 1);
    document.getElementById('existingImages').value = JSON.stringify(existingImages);

    // Remove the image container from the DOM
    const imageContainers = document.querySelectorAll('#imagePreview .image-container');
    imageContainers[index].remove();
}



document.addEventListener('DOMContentLoaded', () => {
    const previewContainer = document.getElementById('imagePreview');
    const existingImages = JSON.parse(document.getElementById('existingImages').value);

    existingImages.forEach((image, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container', 'existing-image-container');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';
        imgContainer.style.marginRight = '10px';

        const img = document.createElement('img');
        img.src = `/${image.replace(/\\/g, '/')}`;
        img.classList.add('img-thumbnail');
        img.style.maxWidth = '100px';

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Remove';
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '5px';
        deleteBtn.style.right = '5px';

        deleteBtn.addEventListener('click', () => {
            console.log(index);
            console.log(existingImages[index]);
            removedImages.push(existingImages[index])
            existingImages.splice(index, 1);
            document.getElementById('existingImages').value = JSON.stringify(existingImages);
            imgContainer.remove();
            // document.getElementById('removedImages').value =JSON.stringify(removedImages); ;
        });
        console.log('sdfsdfasdfasd');

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        previewContainer.appendChild(imgContainer);
    });
});




function previewImages(event) {
    const fileInput = event.target;
    const previewContainer = document.getElementById('imagePreview');

    // Clear only the new images from the preview, keep the existing ones
    const newImageContainers = previewContainer.querySelectorAll('.new-image-container');
    newImageContainers.forEach(container => container.remove());

    const files = Array.from(fileInput.files);
    files.forEach((file, index) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('image-container', 'new-image-container');
                imgContainer.style.position = 'relative';
                imgContainer.style.display = 'inline-block';
                imgContainer.style.marginRight = '10px';

                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('img-thumbnail');
                img.style.maxWidth = '100px';

                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = 'Remove';
                deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteBtn.style.position = 'absolute';
                deleteBtn.style.top = '5px';
                deleteBtn.style.right = '5px';

                deleteBtn.addEventListener('click', () => {
                    files.splice(index, 1);
                    fileInput.files = createFileList(files);
                    imgContainer.remove();

                });

                imgContainer.appendChild(img);
                imgContainer.appendChild(deleteBtn);
                previewContainer.appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        }
    });
}

function createFileList(files) {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
}

