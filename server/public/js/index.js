$(function() {

  $(document).on('submit', '.gen-app-form', function(event) {
    var $form = $(this),
        url = $form.attr('action'),
        formData = new FormData($form[0]);

    $.ajax({
      url: url,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: function () {
        $('#loading-indicator').modal('show');
      },
      complete: function() {
        $('#loading-indicator').modal('hide');
      }
    }).done(function(data) {
      $('#container').empty().append($(data));
    });
    return false;
  });

  function loadClientPage() {
    $('#container').load('/client');
    $('li').removeClass("active");
    $('.client').addClass("active");
  }
  function loadPartnerPage() {
    $('#container').load('/partner');
    $('li').removeClass("active");
    $('.partner').addClass("active");
  }

  $(window).on('popstate', function(event) {
    switch (location.hash) {
      case '#client':
        loadClientPage();
        break;
      case '#partner':
        loadPartnerPage();
        break;
      default:
        loadClientPage();
    }
  });
  $('.client').on('click', function() {
    loadClientPage();
  });
  $('.partner').on('click', function() {
    loadPartnerPage();
  });

  // client page will be shown by default
  loadClientPage();
});
