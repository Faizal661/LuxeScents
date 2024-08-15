function handleFormSubmit(event) {

    event.preventDefault();
    if (!validateForm()) {
        console.error("Form validation is unsuccessful")
        return;
    }
    const name = document.getElementsByName("name")[0].value.trim();
    const description = document.getElementById("descriptionId").value;

    fetch('/admin/addCategory', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            name, description
        })

    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error);
                })
            }
            return response.json().then(data => {
                Swal.fire({
                    icon: 'success',
                    title: "Success",
                    text: "Category added successfully",
                    timer: 2000
                }).then(data => {
                    location.reload();
                })
            });
        })
        .catch(error => {
            if (error.message === "Category already exists") {
                Swal.fire({
                    icon: 'warning',
                    title: "Oops",
                    text: "Category already exists"
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops",
                    text: "An Error occured while adding the category",
                })
            }
        })
}

function validateForm() {
    clearErrorMessage();
    const name = document.getElementsByName("name")[0].value.trim();
    const description = document.getElementById("descriptionId").value.trim();
    let isValid = true;

    if (name == "") {
        displayErrorMessage("name-error", "Please enter a name")
        isValid = false

    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
        displayErrorMessage("name-error", "Category name should contain only alphabetic characters")
        isValid = false
    }
    if (description == "") {
        displayErrorMessage("description-error", "Please enter a description")
        isValid = false

    }

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

