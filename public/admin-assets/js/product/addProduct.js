async function handleFormSubmit(event) {

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



    croppedImagesArray.forEach((image, index) => {
        const blob = dataURItoBlob(image);
        formData.append('productImages', blob, `croppedImage${index}.png`);
    });


    fetch('/admin/addProduct', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    Swal.fire({
                        icon: 'success',
                        title: "Success",
                        text: "product added successfully",
                        timer: 2000
                    }).then(() => {
                        window.location.href = "/admin/products";
                    });
                });
            } else {
                return response.json().then(err => {
                    throw new Error(err.error);
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: "Oops",
                text: error.message || "An error occurred while adding the product"
            });
        });


}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}



// varaitions management in add productt

let variationCount = 1;
const maxVariations = 5;

document.getElementById('add-variation-btn').addEventListener('click', function () {
    if (variationCount >= maxVariations) {
        Swal.fire({
            icon: 'error',
            title: 'Limit Reached',
            text: 'You can only add a maximum of 5 variations per product.',
        });
        return;
    }

    const container = document.getElementById('variations-container');

    const newVariation = document.createElement('div');
    newVariation.classList.add('variation-item', 'mt-3');
    newVariation.innerHTML = `
        <div class="row">
            <div class="text-end mt-2">
            <button type="button" class="btn btn-warning remove-variation-btn">X</button>
        </div>
            <div class="col-md-3">
                <label class="form-label">Size</label>
                <select name="variations[${variationCount}][size]" class="form-select shadow form-control">
                    <option value="25ml">25ml</option>
                    <option value="50ml">50ml</option>
                    <option value="75ml">75ml</option>
                    <option value="100ml">100ml</option>
                    <option value="150ml">150ml</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Quantity</label>
                <input type="number" name="variations[${variationCount}][quantity]" placeholder="Type here" class="form-control shadow" />
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
                <label class="form-label">Regular Price</label>
                <input type="number" name="variations[${variationCount}][regularPrice]" placeholder="Type here" class="form-control shadow" />
            </div>
            <div class="col-md-3">
                <label class="form-label">Sale Price</label>
                <input type="number" name="variations[${variationCount}][salePrice]" placeholder="Type here" class="form-control shadow" />
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



//validation of forms

function validateForm() {
    clearErrorMessage();
    const name = document.getElementsByName("productName")[0].value.trim();
    const description = document.getElementById("descriptionId").value.trim();

    // const quantityInput = document.getElementById("quantityId").value.trim();
    // const regularPriceInput = document.getElementById("regularPriceId").value.trim();
    // const salePriceInput = document.getElementById("salePriceId").value.trim();

    // const quantity = quantityInput === "" ? NaN : parseFloat(quantityInput);
    // const regularPrice = regularPriceInput === "" ? NaN : parseFloat(regularPriceInput);
    // const salePrice = salePriceInput === "" ? NaN : parseFloat(salePriceInput);

    const sizes = Array.from(document.querySelectorAll('input[name="size"]:checked'));
    const files = document.getElementById('productImages').files;

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

    // if (isNaN(quantity)) {
    //     displayErrorMessage("quantity-error", "Please enter Stock of the product");
    //     isValid = false;
    // } else if (quantity < 0) {
    //     displayErrorMessage("quantity-error", "Stock quantity can't be a negative value");
    //     isValid = false;
    // }



    // if (isNaN(regularPrice)) {
    //     displayErrorMessage("regularPrice-error", "Please enter Regular Price");
    //     isValid = false;
    // } else if (regularPrice <= 0) {
    //     displayErrorMessage("regularPrice-error", "Regular Price can't be a negative value or zero");
    //     isValid = false;
    // }

    // if (isNaN(salePrice)) {
    //     displayErrorMessage("salePrice-error", "Please enter Sale Price");
    //     isValid = false;
    // } else if (salePrice <= 0) {
    //     displayErrorMessage("salePrice-error", "Sale Price can't be a negative value or zero");
    //     isValid = false;
    // } else if (salePrice > regularPrice) {
    //     displayErrorMessage("salePrice-error", "Sale Price must be lower than regular price");
    //     isValid = false;
    // }

    // if (sizes.length === 0) {
    //     displayErrorMessage("size-error", "Please select at least one size");
    //     isValid = false;
    // }


    // if (croppedImagesArray.length < 4) {
    //     displayErrorMessage("images-error", "Please select at least four images");
    //     isValid = false;
    // }


    // Variations Validation
    // const variations = document.querySelectorAll('.variation');
    // if (variations.length === 0) {
    //     displayErrorMessage("variation-error", "Please add at least one variation");
    //     isValid = false;
    // } else {
    //     variations.forEach((variation, index) => {
    //         const variationName = variation.querySelector('.variation-name').value.trim();
    //         const variationPrice = variation.querySelector('.variation-price').value.trim();

    //         if (variationName === "") {
    //             displayErrorMessage(`variation-${index + 1}-name-error`, "Please enter a variation name");
    //             isValid = false;
    //         } else if (!/^[a-zA-Z\s]+$/.test(variationName)) {
    //             displayErrorMessage(`variation-${index + 1}-name-error`, "Variation name should contain only alphabetic characters");
    //             isValid = false;
    //         }

    //         if (isNaN(parseFloat(variationPrice))) {
    //             displayErrorMessage(`variation-${index + 1}-price-error`, "Please enter a valid price for the variation");
    //             isValid = false;
    //         } else if (parseFloat(variationPrice) <= 0) {
    //             displayErrorMessage(`variation-${index + 1}-price-error`, "Variation price can't be zero or negative");
    //             isValid = false;
    //         }
    //     });
    // }


    return isValid;
}


function displayErrorMessage(elementId, message) {
    var errorElement = document.getElementById(elementId)
    if (errorElement) {
        errorElement.innerText = message;
        errorElement.style.display = "block";
    } else {
        console.error("Error element not found:", elementId);
    }
}

function clearErrorMessage() {
    var errorElements = document.getElementsByClassName("error-message")
    Array.from(errorElements).forEach((element) => {
        element.innerText = "";
        element.style.display = "none"
    })

}

















//image cropping and preview of cropped images

let croppedImagesArray = [];


function previewImages(event) {
    const fileInput = event.target;
    const files = Array.from(fileInput.files);

    files.forEach((file, index) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgContainer = document.createElement('div');
                imgContainer.classList.add('image-container');
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
                    croppedImagesArray.splice(index, 1);
                    imgContainer.remove();
                });

                imgContainer.appendChild(img);
                imgContainer.appendChild(deleteBtn);
                document.getElementById('imagePreview').appendChild(imgContainer);
            };
            reader.readAsDataURL(file);
        }
    });
}


















const upload = document.querySelector("#productImages");
const cropButton = document.querySelector('#btnCrop');
const croppieContainer = document.querySelector('#CroppieContainer');
const imagePreview = document.querySelector('#imagePreview');
var CroppieContainer = document.getElementById("CroppieContainer")
let currentFile = null;

let croppieInstance = new Croppie(document.createElement('div'), {
    viewport: { width: 150, height: 150, type: 'square' },
    boundary: { width: 250, height: 250 },
    enableResize: true
});
croppieContainer.appendChild(croppieInstance.element);


upload.addEventListener('change', function (e) {
    currentFile = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        croppieInstance.bind({
            url: event.target.result
        });
    };
    reader.readAsDataURL(currentFile);

    cropButton.style.display = 'block';
    CroppieContainer.style.display = 'block';
});

cropButton.addEventListener('click', function () {
    croppieInstance.result('canvas').then(function (croppedImage) {
        croppedImagesArray.push(croppedImage);  // Add cropped image to array

        const imgContainer = document.createElement('div');
        imgContainer.classList.add('image-container');
        imgContainer.style.position = 'relative';
        imgContainer.style.display = 'inline-block';
        imgContainer.style.marginRight = '10px';

        const img = document.createElement('img');
        img.src = croppedImage;
        img.classList.add('img-thumbnail');
        img.style.maxWidth = '100px';

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Remove';
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '5px';
        deleteBtn.style.right = '5px';

        deleteBtn.addEventListener('click', () => {
            const index = croppedImagesArray.indexOf(croppedImage);
            if (index > -1) {
                croppedImagesArray.splice(index, 1);
            }
            imgContainer.remove();
        });

        imgContainer.appendChild(img);
        imgContainer.appendChild(deleteBtn);
        imagePreview.appendChild(imgContainer);

        upload.value = '';
        cropButton.style.display = 'none';
        CroppieContainer.style.display = 'none';

    });
});