$(document).ready(function () {
    <% singleProduct.productImages.forEach(function (image, index) { %>
      $('#zoom<%= index %>').elevateZoom({
          zoomType: "lens",
          lensShape: "square",
          lensSize: 2000,
          // scrollZoom: true,
          zoomActivation: "hover",
          containLensZoom: true,
          responsive: true,
      });
    <% }); %>
  });