const showAlert = (title, icon) => {
  Swal.fire({
    title: title,
    icon: icon,
    timer: 1000,
    width: 400,
  });
};
