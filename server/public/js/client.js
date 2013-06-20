$(function() {
  $('#file-container').on('change', function() {
    $(this).siblings('#file-path').val($(this).val());
  });
  $('#file-browse').on('click', function() {
    $(this).siblings('#file-container').click();
  });
});
